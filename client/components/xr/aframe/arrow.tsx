/* eslint-disable no-prototype-builtins */
import PropertyMapper from './ComponentUtils'
import AFRAME from 'aframe'
const THREE = AFRAME.THREE

export const ComponentName = 'arrow'

export interface ArrowData {
  [key: string]: any
  x: number
  y: number
  z: number

  direction: string
  angle: number

  width: number
  height: number
  depth: number

  color: number
  opacity: number
  disabledopacity: number

  ellipses: boolean
}

export const ArrowComponentSchema: AFRAME.MultiPropertySchema<ArrowData> = {
  x: { type: 'number', default: 0 },
  y: { type: 'number', default: 0 },
  z: { type: 'number', default: 0 },

  direction: { default: 'up' }, // oneOf: ['left', 'right', 'up', 'down', 'angle']
  angle: { type: 'number', default: 0 },

  width: { type: 'number', default: 1 },
  height: { type: 'number', default: 1 },
  depth: { type: 'number', default: 0.01 },

  color: { default: 0xe8f1ff },
  opacity: { type: 'number', default: 1 },
  disabledopacity: { type: 'number', default: 0 },
  ellipses: { type: 'boolean', default: false }

}

export interface Props {
  setupArrow: () => void
  createArrow: () => void
  createEllipses: () => void
  directionToSign: (direction: string) => {xSign: number, ySign: number, rotZ: number}
  ellipsesRadius: number
}

export const ArrowComponent: AFRAME.ComponentDefinition<Props> = {
  schema: ArrowComponentSchema,
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  data: { } as ArrowData,
  // dependencies: ['highlight'],
  ellipsesRadius: 0,

  init: () => {
    this.setupArrow = this.setupArrow.bind(this)
    this.ellipsesRadius = this.data.width / 20
    if (this.el.sceneEl?.hasLoaded) this.setupArrow()
    else this.el.sceneEl?.addEventListener('loaded', this.setupArrow, { once: true })
  },

  update: (oldData: ArrowData) => {
    const changedData = Object.keys(this.data).filter(x => this.data[x] !== oldData[x])
    if (changedData.includes('disabled') && !!this.el.getAttribute('highlight')) {
      this.el.setAttribute('highlight', {
        disabled: this.data.disabled
      })
    }
  },

  remove: () => {
    if (this.el.object3DMap.hasOwnProperty('mesh')) {
      this.el.removeObject3D('mesh')
    }
    if (this.el.object3DMap.hasOwnProperty('mesh1')) {
      this.el.removeObject3D('mesh1')
    }
    this.el.sceneEl?.removeEventListener('loaded', this.setupArrow)
  },

  setupArrow: () => {
    this.createArrow()
    if (this.data.ellipses) this.createEllipses()
  },

  createArrow: () => {
    const data: ArrowData = this.data

    data.offset = {
      x: data.x,
      y: data.y,
      z: data.z
    }

    const shape = new THREE.Shape()
    const width = data.width
    const height = data.height

    shape.moveTo(0, height / 2)
    shape.lineTo(width / 2, -height / 2)
    shape.lineTo(-width / 2, -height / 2)
    shape.lineTo(0, height / 2)

    const geom = new THREE.ShapeBufferGeometry(shape)

    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    const xtranslation = data.width / 4 + this.ellipsesRadius
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    const ytranslation = data.width / 4 + this.ellipsesRadius

    const signs = this.directionToSign(data.direction)
    const xSign = signs.xSign
    const ySign = signs.ySign
    const rotationZ = signs.rotZ

    geom.rotateZ(2 * Math.PI * rotationZ / 360)

    geom.translate(data.offset.x, data.offset.y, data.offset.z)

    // var color = data.color
    const opacity = data.disabled ? data.disabledopacity : data.opacity
    const transparent = !!data.disabled
    const mat = new THREE.MeshBasicMaterial({
      // color: new THREE.Color(color),
      transparent: transparent,
      opacity: opacity,
      side: THREE.DoubleSide
    })

    const mesh = new THREE.Mesh(geom, mat)
    mesh.name = 'arrow'

    if (data.ellipses) {
      switch (data.direction) {
        case 'left':
        case 'right':
          mesh.translateX(xSign * xtranslation)
          break
        case 'up':
        case 'down':
          mesh.translateY(ySign * ytranslation)
          break
      }
    }

    // eslint-disable-next-line
    this.el.setObject3D('mesh', mesh)
  },

  createEllipses () {
    const data = this.data
    const geom = new THREE.CircleBufferGeometry(this.ellipsesRadius)

    const opacity = data.disabled ? data.disabledopacity : data.opacity
    const transparent = !!data.disabled
    const mat = new THREE.MeshBasicMaterial({
      // color: new THREE.Color(color),
      transparent: transparent,
      opacity: opacity,
      side: THREE.DoubleSide
    })

    const mesh1 = new THREE.Mesh(geom, mat)
    mesh1.name = 'ellipse1'
    const mesh2 = new THREE.Mesh(geom, mat)
    mesh2.name = 'ellipse2'
    const mesh3 = new THREE.Mesh(geom, mat)
    mesh3.name = 'ellipse3'

    const signs = this.directionToSign(data.direction)
    const xSign = signs.xSign
    const ySign = signs.xSign

    switch (data.direction) {
      case 'left':
      case 'right':
        mesh1.translateX(xSign * -this.data.width / 4)
        mesh2.translateX(xSign * (2 * this.ellipsesRadius - this.data.width / 4))
        mesh3.translateX(xSign * (4 * this.ellipsesRadius - this.data.width / 4))
        break
      case 'up':
      case 'down':
        mesh2.translateY(ySign * 2 * this.ellipsesRadius)
        mesh3.translateY(ySign * 4 * this.ellipsesRadius)
        break
    }

    this.el.setObject3D('ellipse1', mesh1)
    this.el.setObject3D('ellipse2', mesh2)
    this.el.setObject3D('ellipse3', mesh3)
  },

  directionToSign (direction) {
    let ySign = 1
    let xSign = 1
    let rotZ = 0
    switch (direction) {
      case 'up':
        ySign = 1
        break
      case 'left':
        rotZ = 90
        xSign = -1
        break
      case 'down':
        rotZ = 180
        ySign = -1
        break
      case 'right':
        rotZ = -90
        xSign = 1
        break
      default:
        break
    }
    return { xSign: xSign, ySign: ySign, rotZ: rotZ }
  }
}

const primitiveProps = ['direction', 'color', 'width', 'height', 'disabledopacity', 'ellipses']

export const ArrowPrimitive: AFRAME.PrimitiveDefinition = {
  defaultComponents: {
    ComponentName: {}
  //   'highlight': {
  //     type: 'color',
  //     borderbaseopacity: 0.7,
  //     disabledopacity: 0.2,
  //     color: 0xe8f1ff,
  // }
  },
  mappings: PropertyMapper(primitiveProps, ComponentName)
  // hover: 'highlight.hover',
  // active: 'highlight.active',
  // disabled: 'highlight.disabled',
  // hovercolor: 'highlight.hoverColor',
  // activecolor: 'highlight.activeColor'
  // }
}

const ComponentSystem = {
  name: ComponentName,
  // system: ArrowSystemDef,
  component: ArrowComponent,
  primitive: ArrowPrimitive
}

export default ComponentSystem
