/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import {
  CubeCamera,
  LinearFilter,
  RGBAFormat,
  SRGBColorSpace,
  Scene,
  Vector3,
  WebGLCubeRenderTarget,
  WebGLRenderer
} from 'three'

export default class CubemapCapturer {
  width: number
  height: number
  renderer: WebGLRenderer
  cubeCamera: CubeCamera
  cubeRenderTarget: WebGLCubeRenderTarget
  sceneToRender: Scene

  constructor(renderer: WebGLRenderer, sceneToRender: Scene, resolution: number) {
    this.width = resolution
    this.height = resolution
    this.sceneToRender = sceneToRender
    this.renderer = renderer
    this.cubeCamera = null!
    const gl = this.renderer.getContext()
    const cubeMapSize = Math.min(resolution, gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE))
    this.cubeRenderTarget = new WebGLCubeRenderTarget(cubeMapSize, {
      format: RGBAFormat,
      colorSpace: SRGBColorSpace,
      magFilter: LinearFilter,
      minFilter: LinearFilter
    })
    this.cubeCamera = new CubeCamera(0.1, 1000, this.cubeRenderTarget)
  }

  update = (position: Vector3): WebGLCubeRenderTarget => {
    const autoClear = this.renderer.autoClear
    this.renderer.autoClear = true
    this.cubeCamera.position.copy(position)
    const originalColorSpace = this.renderer.outputColorSpace
    this.renderer.outputColorSpace = SRGBColorSpace
    this.cubeCamera.update(this.renderer, this.sceneToRender)
    this.renderer.outputColorSpace = originalColorSpace
    this.renderer.autoClear = autoClear
    return this.cubeRenderTarget
  }
}
