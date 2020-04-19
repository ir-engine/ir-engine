import AFRAME from 'aframe'
import vertexShader from './eaccube-vertex-shader'
import fragmentShader from './eaccube-fragment-shader'
const THREE = AFRAME.THREE

export const ComponentName = 'eaccube'

export interface EaccubeComponentProps {
  setSrc: (src: HTMLVideoElement | HTMLImageElement) => void
}

export interface EaccubeComponentData {
  src: HTMLVideoElement | HTMLImageElement,
  size: number
}

export const EaccubeComponentSchema: AFRAME.MultiPropertySchema<EaccubeComponentData> = {
  src: { type: 'asset' },
  size: { type: 'int', default: 1 }
}

function generateEACUV(): number[] {
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

  const uv: number[] = [];
  ['R', 'L', 'U', 'D', 'F', 'B'].map((_side, i) => {
    const faceCoords = cubeFaceCoords[i]
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
      // shader: 'flat',
      shader: 'eaccube',
      color: 'white',
      side: 'back'
    })

    // set uv
    const mesh = this.el.getObject3D('mesh') as THREE.Mesh
    const geometry = mesh.geometry as THREE.BufferGeometry
    const uv = geometry.attributes.uv as THREE.BufferAttribute
    (uv.array as Float32Array).set(generateEACUV())
    uv.needsUpdate = true

    mesh.scale.x = -1
    mesh.rotation.y = Math.PI
  },

  update(oldData) {
    if (this.data.src !== oldData.src) {
      this.setSrc(this.data.src)
    }
  },

  setSrc(src: HTMLVideoElement | HTMLImageElement) {
    this.el.setAttribute('material', {
      src
    })
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
