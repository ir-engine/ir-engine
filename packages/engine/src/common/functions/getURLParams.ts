export const URLParams = typeof window === 'undefined' ? undefined : new URL(window.location.toString())
export const useOffscreen = URLParams?.searchParams?.get('offscreen') ? true : false
