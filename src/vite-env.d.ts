/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEFAULT_GEMINI_API_KEY?: string;
  readonly VITE_DEFAULT_OPENAI_API_KEY?: string;
  readonly VITE_GEMINI_ENDPOINT?: string;
  readonly VITE_OPENAI_ENDPOINT?: string;
  readonly VITE_ENABLE_LOCAL_MOCK_FALLBACK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
