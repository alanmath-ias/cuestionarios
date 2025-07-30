/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_DEEPSEEK_API_KEY: string;
    // puedes agregar más variables si necesitas
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  