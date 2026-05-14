// Tipado mínimo para Vite `import.meta.env` usado en la app
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_REFRESH_TOKEN_COOKIE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
