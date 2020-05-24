/* eslint-disable no-prototype-builtins */
import PropertyMapper from './ComponentUtils'
import AFRAME from 'aframe'
const THREE = AFRAME.THREE

export const ComponentName = 'arrow'

export interface ArrowData {
  [key: string]: any,
  x: number,
  y: number,
  z: number,

  direction: string,
  angle: number,

  width: number
  height: number
  depth: number

  color: number,
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
  setupArrow: () => void,
  createArrow: () => void,
  createEllipses: () => void
}

export const ArrowComponent: AFRAME.ComponentDefinition<Props> = {
  schema: ArrowComponentSchema,
  data: {
  } as ArrowData,
  // dependencies: ['highlight'],
  init: function() {
    if (this.el.sceneEl?.hasLoaded) this.setupArrow()
    else this.el.sceneEl?.addEventListener('loaded', this.setupArrow.bind(this))
  },

  update: function(oldData: ArrowData) {
    const changedData = Object.keys(this.data).filter(x => this.data[x] !== oldData[x])
    if (changedData.includes('disabled') && !!this.el.getAttribute('highlight')) {
      this.el.setAttribute('highlight', {
        disabled: this.data.disabled
      })
    }
  },

  remove: function () {
    const meshes = ['mesh', 'mesh1', 'mesh2', 'mesh3']
    meshes.forEach
    if (this.el.object3DMap.hasOwnProperty('mesh')) {
      this.el.removeObject3D('mesh')
    }
    if (this.el.object3DMap.hasOwnProperty('mesh1')) {
      this.el.removeObject3D('mesh1')
    }
  },

  setupArrow() {
    this.createArrow()
    if (this.data.ellipses) this.createEllipses()
  },

  createArrow() {
    const self = this
    const data = self.data

    data.offset = {
      x: 0 + data.x,
      y: 0 + data.y,
      z: 0 + data.z
    }

    const shape = new THREE.Shape()
    const width = data.width
    const height = data.height

    shape.moveTo(0, height / 2)
    shape.lineTo(width / 2, -height / 2)
    shape.lineTo(-width / 2, -height / 2)
    shape.lineTo(0, height / 2)

    const geom = new THREE.ShapeBufferGeometry(shape)

    let rotationZ = data.angle
    let xSign = 0
    let ySign = 0
    let xtranslation = (6 * data.width / 5)
    let ytranslation = (6 * data.height / 5)
    switch (data.direction) {
      case 'up':
        ySign = 1
        break
      case 'left':
        rotationZ = 90
        xSign = -1
        xtranslation = 2 * data.width / 5
        break
      case 'down':
        rotationZ = 180
        ySign = -1
        ytranslation = 2 * data.height / 5
        break
      case 'right':
        rotationZ = -90
        xSign = 1
        break
      default:
        break
    }
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
      mesh.translateX(xSign * xtranslation)
      mesh.translateY(ySign * ytranslation)
    }

    self.el.setObject3D('mesh', mesh)
  },

  createEllipses() {
    const data = this.data
    const geom = new THREE.CircleBufferGeometry(data.width / 10)

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

    mesh2.translateX(2 * data.width / 5)
    mesh3.translateX(4 * data.width / 5)

    this.el.setObject3D('ellipse1', mesh1)
    this.el.setObject3D('ellipse2', mesh2)
    this.el.setObject3D('ellipse3', mesh3)
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
