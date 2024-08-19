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

import { PerspectiveCamera, Scene, WebGLRenderer } from 'three'

export type XR8Type = {
  addCameraPipelineModules
  addCameraPipelineModule
  GlTextureRenderer
  XrController: {
    configure: (args: {
      disableWorldTracking?: boolean
      enableLighting?: boolean
      enableWorldPoints?: boolean
      enableVps?: boolean
      imageTargets?: Array<any>
      leftHandedAxes?: boolean
      mirroredDisplay?: boolean
      scale?: 'responsive' | 'absolute'
    }) => void
    pipelineModule: () => CameraPipelineModule
    hitTest: (
      x: number,
      y: number,
      includedTypes: Array<'FEATURE_POINT' | 'ESTIMATED_SURFACE' | 'DETECTED_SURFACE'>
    ) => Array<{
      type: 'FEATURE_POINT' | 'ESTIMATED_SURFACE' | 'DETECTED_SURFACE' | 'UNSPECIFIED'
      position: Vec3
      rotation: Quat
      distance: number
    }>
    updateCameraProjectionMatrix: (args: { origin: Vec3; facing: Quat }) => void
  }
  XrPermissions
  Vps: {
    makeWayspotWatcher: (args: {
      onVisible: () => void
      onHidden: () => void
      pollGps: boolean
      lat: number
      lng: number
    }) => {
      dispose: () => void
      pollGps: (start: boolean) => void
      setLatLng: (lat: number, lng: number) => void
    }
    projectWayspots: () => Promise<Array<any>>
  }
  Threejs: {
    xrScene: () => { renderer: WebGLRenderer; scene: Scene; camera: PerspectiveCamera }
    pipelineModule: () => CameraPipelineModule
  }
  stop: () => void
  run: (props: { canvas: HTMLCanvasElement }) => void
}

export type CameraPipelineModuleListeners =
  | { event: 'reality.imageloading'; process: (event: Event) => void }
  | { event: 'reality.imagescanning'; process: (event: Event) => void }
  | { event: 'reality.imagefound'; process: (event: Event) => void }
  | { event: 'reality.imageupdated'; process: (event: Event) => void }
  | { event: 'reality.imagelost'; process: (event: Event) => void }
  | { event: 'reality.meshfound'; process: (event: MeshFoundEvent) => void }
  | { event: 'reality.meshupdated'; process: (event: MeshUpdatedEvent) => void }
  | { event: 'reality.meshlost'; process: (event: MeshLostEvent) => void }
  | { event: 'reality.trackingstatus'; process: (event: Event) => void }
  | { event: 'reality.projectwayspotscanning'; process: (event: WayspotScanningEvent) => void }
  | { event: 'reality.projectwayspotfound'; process: (event: WayspotFoundEvent) => void }
  | { event: 'reality.projectwayspotupdated'; process: (event: WayspotUpdatedEvent) => void }
  | { event: 'reality.projectwayspotlost'; process: (event: WayspotLostEvent) => void }
  | { event: 'facecontroller.faceloading'; process: (event: Event) => void }
  | { event: 'facecontroller.facescanning'; process: (event: Event) => void }
  | { event: 'facecontroller.facefound'; process: (event: Event) => void }
  | { event: 'facecontroller.faceupdated'; process: (event: Event) => void }
  | { event: 'facecontroller.facelost'; process: (event: Event) => void }
  | { event: 'handcontroller.handloading'; process: (event: Event) => void }
  | { event: 'handcontroller.handscanning'; process: (event: Event) => void }
  | { event: 'handcontroller.handfound'; process: (event: Event) => void }
  | { event: 'handcontroller.handupdated'; process: (event: Event) => void }
  | { event: 'handcontroller.handlost'; process: (event: Event) => void }

export type CameraPipelineModule = {
  name: string
  onAppResourcesLoaded?: () => void
  onAttach?: (args: { canvas; orientation: number }) => void
  onBeforeRun?: () => void
  onCameraStatusChange?: () => void
  onCanvasSizeChange?: () => void
  onDetach?: () => void
  onDeviceOrientationChange?: (args: { orientation: number }) => void
  onException?: () => void
  onPaused?: () => void
  onProcessCpu?: () => void
  onProcessGpu?: () => void
  onRemove?: () => void
  onRender?: () => void
  onResume?: () => void
  onStart?: () => void
  onUpdate?: (props: onUpdate) => void
  onVideoSizeChange?: () => void
  requiredPermission?: () => void
  listeners?: Array<CameraPipelineModuleListeners>
}

export type Wayspot = {
  id: string
  imageUrl: string
  lat: number
  lng: number
  name: string
  title: string
}

export type WayspotScanningEvent = {
  wayspots: Wayspot[]
  name: 'reality.projectwayspotscanning'
}

export type WayspotFoundEvent = {
  detail: {
    name: string
    position: Vec3
    rotation: Quat
  }
  name: 'reality.projectwayspotfound'
}

export type WayspotLostEvent = {
  detail: {
    name: string
    position: Vec3
    rotation: Quat
  }
  name: 'reality.projectwayspotlost'
}

export type WayspotUpdatedEvent = {
  detail: {
    name: string
    position: Vec3
    rotation: Quat
  }
  name: 'reality.projectwayspotupdated'
}

export type MeshFoundEvent = {
  name: ''
  detail: {
    geometry: {
      attributes: Array<{
        array: Float32Array
        itemSize: number
        name: 'string'
      }>
      index: {
        array: Uint32Array
        itemSize: number
      }
    }
    id: string
    position: Vec3
    rotation: Quat
  }
}
export type MeshUpdatedEvent = {
  name: ''
  detail: {
    id: string
    position: Vec3
    rotation: Quat
  }
}
export type MeshLostEvent = {
  name: ''
  detail: {
    id: string
    position: Vec3
    rotation: Quat
  }
}

export type Vec3 = {
  x: number
  y: number
  z: number
}
export type Quat = {
  x: number
  y: number
  z: number
  w: number
}

type CPUResult = {
  reality: {
    rotation: Quat
    position: Vec3
    intrinsics: number[]
    lighting: {
      exposure: number
      temperature: number
    }
    realityTexture: {
      name: number
      drawCtx: any
    }
    trackingStatus: string
    trackingReason: string
    worldPoints: []
    detectedImages: []
    points: {
      get: () => unknown
      getLength: () => unknown
    }
    meanRGB: number
  }
}

type GPUResult = {
  gltexturerenderer: {
    viewport: {
      offsetX: number
      offsetY: number
      width: number
      height: number
    }
    shader: WebGLProgram
  }
}

export type onUpdate = {
  framework: {
    dispatchEvent: (event: any) => void
  }
  processCpuResult: CPUResult
  processGpuResult: GPUResult
  frameStartResult: {
    cameraTexture: WebGLTexture
    computeTexture: WebGLTexture
    GLctx: WebGL2RenderingContext
    computeCtx: WebGL2RenderingContext
    orientation: number
    repeatFrame: false
    frameTime: number
    textureWidth: number
    textureHeight: number
    videoTime: number
  }
  cameraTextureReadyResult: GPUResult
  fps: number
  GLctx: WebGL2RenderingContext
  cameraTexture: WebGLTexture
  video: any
  heapDataReadyResult: CPUResult
}
