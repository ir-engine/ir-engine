/* eslint-disable no-unused-vars */
declare module '*.jpg' {
  const value: any
  export = value
}

declare module '*.png' {
  const value: any
  export = value
}

declare module '*.json' {
  const value: any
  export = value
}

declare module '*.wav' {
  const value: any
  export = value
}

declare module '*.glb' {
  const value: any
  export = value
}

declare interface Element {
  setAttribute(qualifiedName: string, value: Object): void
}

declare type CbFunction = (this: {
  el: HTMLElement
  [key: string]: any
}) => void
