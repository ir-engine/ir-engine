/* eslint-disable no-unused-vars */
declare module '*.jpg' {
  const value: any
  export default value
}

declare module '*.png' {
  const value: any
  export default value
}

declare module '*.json' {
  const value: any
  export default value
}

declare module '*.wav' {
  const value: any
  export default value
}

declare module '*.glb' {
  const value: any
  export default value
}

declare module '*.frag' {
  const value: any
  export default value
}

declare module '*.vert' {
  const value: any
  export default value
}

declare interface Element {
  setAttribute(qualifiedName: string, value: Object): void
}

declare type CbFunction = (this: {
  el: HTMLElement
  [key: string]: any
}) => void


declare module '*.glb!text' {
  const value: string
  export default value
}

declare module '*.frag!text' {
  const value: string
  export default value
}

declare module '*.vert!text' {
  const value: string
  export default value
}


declare module '*!text' {
  var _: string;
  export default  _;
}