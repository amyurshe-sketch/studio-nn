/// <reference types="vite/client" />

// CRA-style environment variables shim for existing code
declare const process: {
  env: {
    readonly PUBLIC_URL?: string;
    // Common project vars; extend as needed
    readonly REACT_APP_API_URL?: string;
    [key: string]: string | undefined;
  };
};

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string; // preferred
  readonly VITE_API_URL?: string;      // legacy fallback
  readonly VITE_WS_URL?: string;       // websocket endpoint
  [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
