import { PerspectiveCamera, Scene, WebGLRenderer } from 'three'

export type XR8Type = {
  addCameraPipelineModules
  addCameraPipelineModule
  GlTextureRenderer
  XrController
  XrPermissions
  Threejs: {
    xrScene: () => { renderer: WebGLRenderer; scene: Scene; camera: PerspectiveCamera }
    pipelineModule: () => any
  }
  stop: () => void
  run: (props: { canvas: HTMLCanvasElement }) => void
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
      drawCtx: {}
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
