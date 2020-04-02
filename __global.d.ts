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
  
  declare namespace JSX {
    interface IntrinsicElements {
      'a-scene': any
      'a-box': any
      'a-camera': any
      'a-sphere': any
      'a-cylinder': any
      'a-plane': any
      'a-assets': any
      'a-asset-item': any
      'a-entity': any
      'a-animation': any
      'a-sky': any
      'a-mixin': any
      'a-text': any
      'a-image': any
      'a-light': any
      'a-gltf-model': any
    }
  }
  
  declare interface Element {
    setAttribute(qualifiedName: string, value: Object): void
  }
  
  declare type CbFunction = (this: {
    el: HTMLElement
    [key: string]: any
  }) => void
  declare let AFRAME: {
    registerComponent: (
      name: string,
      config: { init: CbFunction; [key: string]: CbFunction }
    ) => void
  }