
/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

/// <reference types="vite-plugin-svgr/client" />


/* eslint-disable no-unused-vars */
declare module '*.jpg'
declare module '*.png'
declare module '*.svg'
declare module '*.scss'
declare module '*.scss?inline'
declare module '*.svg?react'
declare module '*.css'
declare module '*.css?inline'
declare module '*.svg?react'
declare module '*.json'
declare module '*.wav'
declare module '*.glb'
declare module '*.frag'
declare module '*.vert'

declare interface Element {
  setAttribute(qualifiedName: string, value: object): void
}

declare type CbFunction = (this: { el: HTMLElement; [key: string]: any }) => void

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
  const _: string
  export default _
}
