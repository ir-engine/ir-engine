;(globalThis as any).process = { env: { ...(import.meta as any).env, APP_ENV: (import.meta as any).env.MODE } }
