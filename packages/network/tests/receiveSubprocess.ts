const { log, error, warn, info, debug } = console
console.log = (...args: any[]) => log('[Subprocess]', Date.now(), ...args)
console.error = (...args: any[]) => error('[Subprocess]', Date.now(), ...args)
console.warn = (...args: any[]) => warn('[Subprocess]', Date.now(), ...args)
console.info = (...args: any[]) => info('[Subprocess]', Date.now(), ...args)
console.debug = (...args: any[]) => debug('[Subprocess]', Date.now(), ...args)
