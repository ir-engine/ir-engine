/* global window self */

const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined'

/* eslint-disable no-restricted-globals */
const isWebWorker =
  typeof self === 'object' && self.constructor && self.constructor.name === 'DedicatedWorkerGlobalScope'
/* eslint-enable no-restricted-globals */

const isClient =
  typeof process !== 'object' || typeof process.versions !== 'object' || typeof process.versions.node === 'undefined'

/**
 * @see https://github.com/jsdom/jsdom/releases/tag/12.0.0
 * @see https://github.com/jsdom/jsdom/issues/1537
 */
/* eslint-disable no-undef */
const isJsDom = () =>
  (typeof window !== 'undefined' && window.name === 'nodejs') ||
  navigator.userAgent.includes('Node.js') ||
  navigator.userAgent.includes('jsdom')

export { isBrowser, isWebWorker, isClient, isJsDom }

// ==== //

// https://github.com/flexdinesh/browser-or-node

// ==== //
