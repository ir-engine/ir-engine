import { XMLHttpRequest } from 'xmlhttprequest'
// Patch XHR for FileLoader in threejs
;(globalThis as any).XMLHttpRequest = XMLHttpRequest
;(globalThis as any).self = globalThis
