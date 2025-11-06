/*
  Unified WebSocket client with batching and acking.

  - Single connection per app (singleton)
  - Batches outgoing messages within a short window
  - Each message has an id and expects an ack/response
  - Retries with backoff on timeout, supports reconnection
  - Simple RPC interface: request(type, payload) → Promise
  - Pub/sub: on(event, handler) for server-pushed events
*/

import { WS_URL as WS_URL_CONFIG, API_UNCONFIGURED } from './env';

type JSONValue = any;

type OutgoingMessage = {
  id: string;
  kind: 'rpc' | 'event';
  type: string;
  payload?: JSONValue;
  ts?: number;
};

type IncomingBatch = {
  type: 'batch';
  messages: Array<IncomingMessage>;
};

type IncomingAck = {
  type: 'ack';
  id: string;
};

type IncomingRPCResult = {
  type: 'rpc_result';
  id: string;
  result: JSONValue;
};

type IncomingRPCError = {
  type: 'rpc_error';
  id: string;
  error: { message: string; code?: string | number; data?: JSONValue };
};

type IncomingEvent = {
  type: 'event';
  event: string;
  payload?: JSONValue;
};

type IncomingMessage = IncomingAck | IncomingRPCResult | IncomingRPCError | IncomingEvent;

type PendingEntry = {
  resolve: (v: any) => void;
  reject: (e: any) => void;
  sentAt: number;
  tries: number;
  msg: OutgoingMessage;
  timeout: number;
};

class WSClient {
  private ws: WebSocket | null = null;
  private url: string;
  private ready = false;
  private connecting = false;
  private reconnectAttempts = 0;
  private batch: OutgoingMessage[] = [];
  private batchTimer: any = null;
  private batchInterval = 25; // ms
  private maxBatchSize = 32;
  private pending = new Map<string, PendingEntry>();
  private listeners = new Map<string, Set<(p: any) => void>>();
  private pingTimer: any = null;
  private pingIntervalMs = 60_000; // 60 seconds
  private autoReconnect = true;

  constructor(url: string) {
    this.url = url;
  }

  isReady() {
    return this.ready;
  }

  on(event: string, handler: (payload: any) => void) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(handler);
    return () => this.off(event, handler);
  }

  off(event: string, handler: (payload: any) => void) {
    this.listeners.get(event)?.delete(handler);
  }

  private emit(event: string, payload: any) {
    this.listeners.get(event)?.forEach((fn) => {
      try { fn(payload); } catch {}
    });
  }

  connect(): Promise<void> {
    if (this.ready) return Promise.resolve();
    if (this.connecting) return new Promise((res) => this.on('open', () => res()));
    this.connecting = true;

    return new Promise((resolve, reject) => {
      try {
        const ws = new WebSocket(this.url);
        // Send cookies on WS handshake: browser includes cookies for the target origin.
        this.ws = ws;

        ws.onopen = () => {
          this.ready = true;
          this.connecting = false;
          this.reconnectAttempts = 0;
          this.emit('open', null);
          // Start periodic ping
          this.clearPing();
          this.pingTimer = setInterval(() => {
            try {
              this.send('ping', { ts: Date.now() });
            } catch {}
          }, this.pingIntervalMs);
          resolve();
        };

        ws.onmessage = (ev) => this.handleMessage(ev.data);

        ws.onclose = () => {
          this.ready = false;
          this.connecting = false;
          this.emit('close', null);
          this.clearPing();
          // retry with backoff only if allowed
          if (this.autoReconnect) {
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
            this.reconnectAttempts++;
            setTimeout(() => {
              this.connect().catch(() => {});
            }, delay);
          }
        };

        ws.onerror = () => {
          // Allow close handler to drive reconnection
        };
      } catch (e) {
        this.connecting = false;
        reject(e);
      }
    });
  }

  close() {
    try { this.ws?.close(); } catch {}
    this.ws = null;
    this.ready = false;
    this.clearPing();
  }

  setAutoReconnect(flag: boolean) {
    this.autoReconnect = !!flag;
  }

  private handleMessage(raw: any) {
    let data: any;
    try { data = JSON.parse(raw); } catch { return; }
    if (Array.isArray(data?.messages) && data?.type === 'batch') {
      (data as IncomingBatch).messages.forEach((m) => this.handleOne(m));
      return;
    }
    this.handleOne(data as IncomingMessage);
  }

  private handleOne(msg: IncomingMessage) {
    switch (msg.type) {
      case 'ack': {
        const p = this.pending.get((msg as IncomingAck).id);
        if (p) {
          // no resolution on ack — keep waiting for rpc_result unless event
        }
        break;
      }
      case 'rpc_result': {
        const { id, result } = msg as IncomingRPCResult;
        const p = this.pending.get(id);
        if (p) {
          this.pending.delete(id);
          p.resolve(result);
        }
        break;
      }
      case 'rpc_error': {
        const { id, error } = msg as IncomingRPCError;
        const p = this.pending.get(id);
        if (p) {
          this.pending.delete(id);
          p.reject(Object.assign(new Error(error?.message || 'WS error'), { code: error?.code, data: error?.data }));
        }
        break;
      }
      case 'event': {
        const { event, payload } = msg as IncomingEvent;
        // Auto-respond to server pings
        if (event === 'ping') {
          this.send('pong', { ts: Date.now() });
        }
        this.emit(event, payload);
        break;
      }
      default:
        break;
    }
  }

  private scheduleFlush() {
    if (this.batchTimer) return;
    this.batchTimer = setTimeout(() => this.flush(), this.batchInterval);
  }

  private flush() {
    if (!this.ws || !this.ready) { this.batchTimer = null; return; }
    if (this.batch.length === 0) { this.batchTimer = null; return; }
    const messages = this.batch.splice(0, this.maxBatchSize);
    if (this.batch.length > 0) this.scheduleFlush();
    const payload = JSON.stringify({ type: 'batch', messages });
    try { this.ws.send(payload); } catch {}
    this.batchTimer = null;
  }

  private enqueue(msg: OutgoingMessage) {
    this.batch.push(msg);
    if (this.batch.length >= this.maxBatchSize) {
      this.flush();
    } else {
      this.scheduleFlush();
    }
  }

  private nextId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  async request(type: string, payload?: any, opts?: { timeoutMs?: number; retry?: number }): Promise<any> {
    const timeout = opts?.timeoutMs ?? 10000;
    const retry = Math.max(0, opts?.retry ?? 1);
    const id = this.nextId();
    const msg: OutgoingMessage = { id, kind: 'rpc', type, payload, ts: Date.now() };

    const attempt = (triesLeft: number): Promise<any> => new Promise((resolve, reject) => {
      const entry: PendingEntry = { resolve, reject, sentAt: Date.now(), tries: (retry - triesLeft), msg, timeout };
      this.pending.set(id, entry);
      if (!this.ready) {
        // try connecting first
        this.connect().catch(() => {});
      }
      this.enqueue(msg);
      const timer = setTimeout(() => {
        // timeout: maybe retry
        if (triesLeft > 0) {
          // resend with backoff
          const backoff = Math.min(1000 * Math.pow(2, entry.tries), 8000);
          setTimeout(() => {
            attempt(triesLeft - 1).then(resolve, reject);
          }, backoff);
        } else {
          this.pending.delete(id);
          reject(new Error(`WS request timeout for ${type}`));
        }
      }, timeout);
      // Wrap resolve/reject to clear timer
      const origResolve = resolve;
      const origReject = reject;
      entry.resolve = (v) => { clearTimeout(timer); origResolve(v); };
      entry.reject = (e) => { clearTimeout(timer); origReject(e); };
    });

    return attempt(retry);
  }

  send(event: string, payload?: any) {
    const msg: OutgoingMessage = { id: this.nextId(), kind: 'event', type: event, payload, ts: Date.now() };
    if (!this.ready) this.connect().catch(() => {});
    this.enqueue(msg);
  }

  private clearPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }
}

// Configure from env with fallback
const WS_URL = WS_URL_CONFIG || (import.meta as any).env?.VITE_WS_URL || 'ws://localhost:8000/ws';

// Protective stub when API is not configured: no-op client
class WSStub {
  isReady() { return false; }
  on() { return () => {}; }
  off() {}
  connect() { return Promise.resolve(); }
  close() {}
  request() { return Promise.reject(new Error('Backend is not configured')); }
  send() {}
  setAutoReconnect() {}
}

export const wsClient = API_UNCONFIGURED ? (new WSStub() as any) : new WSClient(WS_URL);
