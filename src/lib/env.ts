// Prefer VITE_API_BASE_URL; fall back to legacy VITE_API_URL or CRA-style REACT_APP_API_URL
const VITE_API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || (import.meta as any).env?.VITE_API_URL;
// @ts-ignore CRA shim lives in env.d.ts
const CRA_API = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) ? process.env.REACT_APP_API_URL : undefined;
export const API_BASE_URL = VITE_API_BASE || CRA_API || 'http://localhost:8000';

// WebSocket endpoint (always explicit on prod)
export const WS_URL = (import.meta as any).env?.VITE_WS_URL || 'ws://localhost:8000/ws';

// Protective mode: allow disabling API for preview builds without backend
const DISABLE_API_FLAG = ((import.meta as any).env?.VITE_DISABLE_API || '').toString().toLowerCase() === 'true';
const isBrowser = typeof window !== 'undefined';
const host = isBrowser ? window.location.hostname : '';
const onLocalhost = /^(localhost|127\.0\.0\.1)$/i.test(host || '');
const apiLooksLocal = /localhost|127\.0\.0\.1/.test(API_BASE_URL);
const wsLooksLocal = /localhost|127\.0\.0\.1/.test(WS_URL);
export const API_UNCONFIGURED = DISABLE_API_FLAG || (!onLocalhost && (apiLooksLocal || wsLooksLocal));
