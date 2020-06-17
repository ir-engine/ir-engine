import AFRAME from 'aframe'
import vertexShader from './eaccube-vertex-shader'
import fragmentShader from './eaccube-fragment-shader'
import PropertyMapper from './ComponentUtils'

const THREE = AFRAME.THREE

export const ComponentName = 'eaccube'

export interface EaccubeComponentProps {
  setSrc: (src: HTMLVideoElement | HTMLImageElement) => void,
  updateUV: () => void,
  cropTileX: number,
  cropTileY: number,
  srcReadyListener: () => void,
  onSrcReady: () => void,
  unsetSrc: (src: HTMLVideoElement | HTMLImageElement) => void
}

export interface EaccubeComponentData {
  src: HTMLVideoElement | HTMLImageElement,
  tileOrder: string,
  tileRotation: string,
  tileFlip: string,
  size: number,
  cropTileXBase: number,
  cropTileYBase: number
}

const TILE_ROTATION_RIGHT = 'R' // 90deg cw
const TILE_ROTATION_LEFT = 'L' // 90deg ccw
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TILE_ROTATION_UP = 'U' // no rotation
const TILE_ROTATION_DOWN = 'D' // 180deg
const CubeFaceOrder = 'RLUDFB'
const TileOrderRegExp = new RegExp(`^[${CubeFaceOrder}]{6}$`, 'i')
const TileOrderInvalidMsg = 'tileOrder is not valid'
const DefaultTileOrder = 'FLBDUR'
const DefaultTileRotation = 'LUDUUU'

export const EaccubeComponentSchema: AFRAME.MultiPropertySchema<EaccubeComponentData> = {
  src: { type: 'asset' },
  tileOrder: {
    type: 'string',
    default: DefaultTileOrder,
    parse: val => {
      if (!TileOrderRegExp.test(val)) {
        throw new Error(TileOrderInvalidMsg)
      }
      return val.toUpperCase()
    }
  },
  tileRotation: {
    type: 'string',
    default: DefaultTileRotation,
    parse: val => {
      return val.toUpperCase()
    }
  },
  tileFlip: { type: 'string', default: '000000' },
  size: { type: 'int', default: 1000 },
  cropTileXBase: { type: 'number', default: 0 },
  cropTileYBase: { type: 'number', default: 0 }
}

function generateEACUV(tileOrder: string[], tileRotation: string[], tileFlip: string[], cropX: number, cropY: number): number[] {
  const cubeFaceCoords: number[][] = []
  const rows = 2
  const cols = 3
  for (let r = rows - 1; r >= 0; r--) {
    for (let c = 0; c < cols; c++) {
      cubeFaceCoords.push(cropFaceBorders([
        clamp(c / cols, 0, 1),
        clamp((r + 1) / rows, 0, 1),

        clamp(c / cols, 0, 1),
        clamp(r / rows, 0, 1),

        clamp((c + 1) / cols, 0, 1),
        clamp(r / rows, 0, 1),

        clamp((c + 1) / cols, 0, 1),
        clamp((r + 1) / rows, 0, 1)
      ], cropX, cropY))
    }
  }

  const cubeFaceOrderArray = CubeFaceOrder.split('')
  const tileIndexOrder = tileOrder.map(faceName => cubeFaceOrderArray.indexOf(faceName))

  const uv: number[] = []
  cubeFaceOrderArray.forEach((_, i) => {
    const cubeFaceIndex = tileIndexOrder[i]
    const faceCoords = transformFaceCoord(cubeFaceCoords[cubeFaceIndex], tileRotation[i], tileFlip[i])
    uv.push(
      faceCoords[0], faceCoords[1],
      faceCoords[2], faceCoords[3],
      faceCoords[6], faceCoords[7],

      faceCoords[2], faceCoords[3],
      faceCoords[4], faceCoords[5],
      faceCoords[6], faceCoords[7]
    )
  })

  return uv
}
const transformFaceCoord = (faceCoord: number[], tileRotation: string, tileFlip: string) => {
  // flip first
  if (parseInt(tileFlip)) {
    faceCoord = flipFaceCoord(faceCoord)
  }
  // then rotate
  faceCoord = rotateFaceCoord(faceCoord, tileRotation)
  return faceCoord
}
const flipFaceCoord = (faceCoord: number[]) => {
  return [
    faceCoord[6], faceCoord[7],
    faceCoord[4], faceCoord[5],
    faceCoord[2], faceCoord[3],
    faceCoord[0], faceCoord[1]
  ]
}
const rotateFaceCoord = (faceCoord: number[], rotation: string) => {
  switch (rotation) {
    case TILE_ROTATION_LEFT:
      // 90 ccw
      return [
        faceCoord[6], faceCoord[7],
        faceCoord[0], faceCoord[1],
        faceCoord[2], faceCoord[3],
        faceCoord[4], faceCoord[5]
      ]
    case TILE_ROTATION_RIGHT:
      // -90 ccw
      return [
        faceCoord[2], faceCoord[3],
        faceCoord[4], faceCoord[5],
        faceCoord[6], faceCoord[7],
        faceCoord[0], faceCoord[1]
      ]
    case TILE_ROTATION_DOWN:
      // 180 or -180 ccw
      return [
        faceCoord[4], faceCoord[5],
        faceCoord[6], faceCoord[7],
        faceCoord[0], faceCoord[1],
        faceCoord[2], faceCoord[3]
      ]
    default:
      // TILE_ROTATION_UP no rotation
      break
  }
  return faceCoord
}
function cropFaceBorders(faceCoord: number[], cropX: number, cropY: number) {
  return [
    faceCoord[0] + cropX, faceCoord[1] - cropY,
    faceCoord[2] + cropX, faceCoord[3] + cropY,
    faceCoord[4] - cropX, faceCoord[5] + cropY,
    faceCoord[6] - cropX, faceCoord[7] - cropY
  ]
}

export const EaccubeComponent: AFRAME.ComponentDefinition<EaccubeComponentProps> = {
  schema: EaccubeComponentSchema,
  data: {
  } as EaccubeComponentData,
  cropTileX: 0,
  cropTileY: 0,
  srcReadyListener: () => null,

  init() {
    this.srcReadyListener = this.onSrcReady.bind(this)

    this.el.setAttribute('geometry', {
      buffer: true,
      primitive: 'box',
      width: this.data.size,
      height: this.data.size,
      depth: this.data.size,
      segmentsWidth: 1,
      segmentsHeight: 1,
      segmentsDepth: 1,
      skipCache: true
    })

    this.el.setAttribute('material', {
      npot: true,
      shader: 'eaccube',
      color: 'white',
      side: 'back'
    })

    const mesh = this.el.getObject3D('mesh')
    mesh.scale.x = -1
    mesh.rotation.y = Math.PI / 2
  },

  update(oldData) {
    if (this.data.src !== oldData.src) {
      this.unsetSrc(oldData.src)
      this.setSrc(this.data.src)
    }

    const uvNeedsUpdate = this.data.tileOrder !== oldData.tileOrder ||
      this.data.tileFlip !== oldData.tileFlip ||
      this.data.tileRotation !== oldData.tileRotation
    if (uvNeedsUpdate) {
      this.updateUV()
    }
  },

  setSrc(src: HTMLVideoElement | HTMLImageElement) {
    this.el.setAttribute('material', {
      src
    })

    if ((src as HTMLVideoElement).videoWidth > 0 || (src as HTMLImageElement).naturalWidth > 0) {
      this.onSrcReady()
    } else if (src.tagName === 'VIDEO') {
      src.addEventListener('loadeddata', this.srcReadyListener, { once: true })
    } else { // IMG
      src.addEventListener('load', this.srcReadyListener, { once: true })
    }
  },

  updateUV() {
    const mesh = this.el.getObject3D('mesh') as THREE.Mesh
    const geometry = mesh.geometry as THREE.BufferGeometry
    const uv = geometry.attributes.uv as THREE.BufferAttribute
    (uv.array as Float32Array).set(
      generateEACUV(
        this.data.tileOrder.split(''),
        this.data.tileRotation.split(''),
        this.data.tileFlip.split(''),
        this.cropTileX,
        this.cropTileY
      )
    )
    uv.needsUpdate = true
  },

  unsetSrc(src: HTMLVideoElement | HTMLImageElement) {
    if (!src) {
      return
    }
    this.cropTileX = this.cropTileY = 0
    if (src.tagName === 'VIDEO') {
      src.removeEventListener('loadeddata', this.srcReadyListener)
    } else { // IMG
      src.removeEventListener('load', this.srcReadyListener)
    }
  },

  onSrcReady() {
    let srcWidth, srcHeight
    const src = this.data.src
    if (src.tagName === 'VIDEO') {
      srcWidth = src.videoWidth
      srcHeight = src.videoHeight
    } else { // IMG
      srcWidth = src.naturalWidth
      srcHeight = src.naturalHeight
    }
    this.cropTileX = this.data.cropTileXBase * 2 / srcWidth
    this.cropTileY = this.data.cropTileYBase * 2 / srcHeight

    this.updateUV()
  }
}

const primitiveProps = ['src', 'size']

export const EaccubePrimitive: AFRAME.PrimitiveDefinition = {
  defaultComponents: {
    [ComponentName]: {}
  },
  mappings: PropertyMapper(primitiveProps, ComponentName)
}

export interface EaccubeShaderData {
  src: HTMLVideoElement | HTMLImageElement
}

export const EaccubeShaderSchema: AFRAME.MultiPropertySchema<any> = {
  src: { type: 'map', is: 'uniform' }
}

export const EaccubeShader: AFRAME.ShaderDefinition = {
  schema: EaccubeShaderSchema,
  vertexShader,
  fragmentShader
}

const ComponentSystem = {
  name: ComponentName,
  component: EaccubeComponent,
  primitive: EaccubePrimitive,
  shader: EaccubeShader
}

function clamp ( value, min, max ) {
  return Math.max( min, Math.min( max, value ) );
}

export default ComponentSystem
