import AFRAME from 'aframe'
import vertexShader from './eaccube-vertex-shader'
import fragmentShader from './eaccube-fragment-shader'
const THREE = AFRAME.THREE

export const ComponentName = 'eaccube'

export interface EaccubeComponentProps {
  setSrc: (src: HTMLVideoElement | HTMLImageElement) => void,
  updateUV: () => void
}

export interface EaccubeComponentData {
  src: HTMLVideoElement | HTMLImageElement,
  tileOrder: string,
  tileRotation: string,
  tileFlip: string,
  size: number
}

const TILE_ROTATION_RIGHT = 'R' // 90deg cw
const TILE_ROTATION_LEFT = 'L' // 90deg ccw
// @ts-ignore
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
  size: { type: 'int', default: 1000 }
}

function generateEACUV(tileOrder: string[], tileRotation: string[], tileFlip: string[]): number[] {
  const cubeFaceCoords: number[][] = []
  const rows = 2
  const cols = 3
  for (let r = rows - 1; r >= 0; r--) {
    for (let c = 0; c < cols; c++) {
      cubeFaceCoords.push([
        THREE.MathUtils.clamp(c / cols, 0, 1),
        THREE.MathUtils.clamp((r + 1) / rows, 0, 1),

        THREE.MathUtils.clamp(c / cols, 0, 1),
        THREE.MathUtils.clamp(r / rows, 0, 1),

        THREE.MathUtils.clamp((c + 1) / cols, 0, 1),
        THREE.MathUtils.clamp(r / rows, 0, 1),

        THREE.MathUtils.clamp((c + 1) / cols, 0, 1),
        THREE.MathUtils.clamp((r + 1) / rows, 0, 1)
      ])
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
function transformFaceCoord(faceCoord: number[], tileRotation: string, tileFlip: string) {
  // flip first
  if (parseInt(tileFlip)) {
    faceCoord = flipFaceCoord(faceCoord)
  }
  // then rotate
  faceCoord = rotateFaceCoord(faceCoord, tileRotation)
  return faceCoord
}
function flipFaceCoord(faceCoord: number[]) {
  return [
    faceCoord[6], faceCoord[7],
    faceCoord[4], faceCoord[5],
    faceCoord[2], faceCoord[3],
    faceCoord[0], faceCoord[1]
  ]
}
function rotateFaceCoord(faceCoord: number[], rotation: string) {
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

export const EaccubeComponent: AFRAME.ComponentDefinition<EaccubeComponentProps> = {
  schema: EaccubeComponentSchema,
  data: {
  } as EaccubeComponentData,

  init() {
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
      src: this.data.src,
      npot: true,
      shader: 'eaccube',
      color: 'white',
      side: 'back'
    })

    this.updateUV()

    const mesh = this.el.getObject3D('mesh')
    mesh.scale.x = -1
    mesh.rotation.y = Math.PI / 2
  },

  update(oldData) {
    if (this.data.src !== oldData.src) {
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
  },

  updateUV() {
    const mesh = this.el.getObject3D('mesh') as THREE.Mesh
    const geometry = mesh.geometry as THREE.BufferGeometry
    const uv = geometry.attributes.uv as THREE.BufferAttribute
    (uv.array as Float32Array).set(
      generateEACUV(
        this.data.tileOrder.split(''),
        this.data.tileRotation.split(''),
        this.data.tileFlip.split('')
      )
    )
    uv.needsUpdate = true
  }
}

export const EaccubePrimitive: AFRAME.PrimitiveDefinition = {
  defaultComponents: {
    [ComponentName]: {}
  },
  mappings: {
    src: ComponentName + '.src',
    size: ComponentName + '.size'
  }
}

export interface EaccubeShaderData {
  src: HTMLVideoElement | HTMLImageElement
}

// TODO cleanup type, should be AFRAME.MultiPropertySchema<EaccubeShaderData>: 'is' is mandatory but missing in AFRAME.SinglePropertySchema definition
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

export default ComponentSystem
