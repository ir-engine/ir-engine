/* eslint-disable no-prototype-builtins */
import AFRAME from 'aframe'
const THREE = AFRAME.THREE

export const ComponentName = 'highlight'

export interface Data {
  [key: string]: any,
  hover: boolean,
  active: boolean,
  disabled: boolean,
  color: number,
  hoverColor: number,
  activeColor: number,
  disabledColor: number,
  type: string,
  target: string,

  bordersize: number,
  borderbaseopacity: number,

  disabledopacity: number,

  createborder: boolean,
  bordername: string,

  meshes: [string]
}

export const ComponentSchema: AFRAME.MultiPropertySchema<Data> = {
  hover: { default: false },
  active: { default: false },
  disabled: { default: false },
  color: { default: 0x484848 },
  hoverColor: { default: 0x04FF5F },
  activeColor: { default: 0xFFD704 },
  disabledColor: { default: 0xA9A9A9 },
  type: { default: 'color' }, // oneOf: ['color', 'border', 'text']
  target: { default: '', type: 'string' },

  bordersize: { default: 0.05 },
  borderbaseopacity: { default: 0 },

  disabledopacity: { default: 0 },

  createborder: { default: false },
  bordername: { default: 'border' },

  meshes: { default: ['mesh'] }
}

export interface Props {
  initHighlight: () => void,
  addHandlers: () => void,
  removeHandlers: () => void,
  aHandler: () => void,
  intersectingRaycaster: any,
  intersection: any,
  createBorder: () => void,
  createBorderSphere: (geomAttribute: any) => void,
  createBorderPlane: (geomAttribute: any) => void,
  updateColor: () => void,
  updateTextColor: () => void,
  handleIntersection: (attribute: string) => void,
  raycasterIntersectedHandler: (evt: any) => void,
  raycasterIntersectedClearedHandler: (evt: any) => void,
  mousedownHandler: (evt: any) => void,
  mouseupHandler: (evt: any) => void
}

export const Component: AFRAME.ComponentDefinition<Props> = {
  schema: ComponentSchema,
  data: {
  } as Data,

  intersectingRaycaster: null,
  intersection: null,

  init () {
    if (this.el.sceneEl?.hasLoaded) this.initHighlight()
    else this.el.sceneEl?.addEventListener('loaded', this.initHighlight.bind(this))
  },

  play() {
    if (!this.data.disabled) {
      this.addHandlers()
    }
  },

  pause() {
    if (!this.data.disabled) {
      this.removeHandlers()
    }
  },

  tick() {
    this.handleIntersection('hover')
  },

  update(oldData: Data) {
    const data = this.data
    const changedData = Object.keys(this.data).filter(x => this.data[x] !== oldData[x])

    if (changedData.includes('disabled')) {
      this.el.setAttribute('highlight', { hover: false, active: false })
    }

    if (['hover', 'active', 'disabled'].some(prop => changedData.includes(prop))) {
      if (data.type === 'color') {
        this.updateColor()
      } else if (data.type === 'text') {
        this.updateTextColor()
      } else if (data.type === 'border' && this.el.object3DMap.hasOwnProperty(this.data.bordername)) {
        this.updateColor()
      }
    }
    if (changedData.includes('disabled')) {
      if (!data.disabled) {
        this.addHandlers()
      } else {
        this.removeHandlers()
      }
    }
  },

  initHighlight() {
    if (this.data.createborder) {
      this.createBorder()
    }
  },

  aHandler() {

  },

  addHandlers: function() {
    this.el.addEventListener('raycaster-intersected', this.raycasterIntersectedHandler.bind(this))
    this.el.addEventListener('raycaster-intersected-cleared', this.raycasterIntersectedClearedHandler.bind(this))
    this.el.addEventListener('mousedown', this.mousedownHandler.bind(this))
    this.el.addEventListener('mouseup', this.mouseupHandler.bind(this))
  },

  removeHandlers: function() {
    this.el.removeEventListener('raycaster-intersected', this.raycasterIntersectedHandler)
    this.el.removeEventListener('raycaster-intersected-cleared', this.raycasterIntersectedClearedHandler)
    this.el.removeEventListener('mousedown', this.mousedownHandler)
    this.el.removeEventListener('mouseup', this.mouseupHandler)
  },

  createBorder() {
    const self = this
    const data = self.data

    let geomAttribute

    if (data.target === '') {
      geomAttribute = self.el.getAttribute('geometry')
    } else {
      // eslint-disable-next-line no-prototype-builtins
      if (self.el.object3DMap.hasOwnProperty(data.target)) {
        const geo = (self.el.getObject3D(data.target) as THREE.Mesh).geometry
        geomAttribute = (geo as any).parameters
        if (geo.type === 'PlaneBufferGeometry') {
          geomAttribute.primitive = 'plane'
          geomAttribute.buffer = true
          geomAttribute.skipCache = false
          geomAttribute.segmentsHeight = geomAttribute.heightSegments || 1
          geomAttribute.segmentsWidth = geomAttribute.widthSegments || 1
        }
      } else {
        self.el.addEventListener('media-mesh-set', () => {
          self.createBorder()
        })
        return
      }
    }
    if (geomAttribute) {
      switch (geomAttribute.primitive) {
        case 'sphere':
          self.createBorderSphere(geomAttribute)
          break
        case 'plane':
          self.createBorderPlane(geomAttribute)
          break
        default:
          break
      }
    }
  },

  createBorderSphere(geomAttribute) {
    const self = this
    const data = self.data

    const borderGeomAttribute = Object.assign({}, geomAttribute)
    borderGeomAttribute.radius = borderGeomAttribute.radius * (1 + data.bordersize)
    // (this.system as AFRAME.SystemDefinition<MediaCellSystemProps>)
    const geom = (self.el.sceneEl?.systems.geometry as any).getOrCreateGeometry(borderGeomAttribute)

    const color = data.active ? data.activeColor : data.hover ? data.hoverColor : data.color

    const opacity = data.active || data.hover ? 1 : data.borderbaseopacity
    const transparent = !(data.active || data.hover)

    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      side: THREE.BackSide,
      opacity: opacity,
      transparent: transparent
    })
    const newMesh = new THREE.Mesh(geom, mat)
    newMesh.name = this.data.bordername
    newMesh.updateMatrix()

    self.el.setObject3D(this.data.bordername, newMesh)
  },

  createBorderPlane(geomAttribute) {
    const self = this
    const data = Object.assign({}, self.data)

    const borderGeomAttribute = Object.assign({}, geomAttribute)
    borderGeomAttribute.width = borderGeomAttribute.width * (1 + data.bordersize)
    borderGeomAttribute.height = borderGeomAttribute.height * (1 + data.bordersize)
    const cache = (self.el.sceneEl?.systems.geometry as any).cache
    const hash = (self.el.sceneEl?.systems.geometry as any).hash(borderGeomAttribute)
    const isCached = !!cache[hash]
    const geom = (self.el.sceneEl?.systems.geometry as any).getOrCreateGeometry(borderGeomAttribute)
    if (!isCached) {
      geom.translate(0, 0, -0.001)
    }

    const color = data.active ? data.activeColor : data.hover ? data.hoverColor : data.color

    const opacity = data.active || data.hover ? 1 : data.borderbaseopacity
    const transparent = !(data.active || data.hover)

    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      side: THREE.FrontSide,
      opacity: opacity,
      transparent: transparent
    })
    const mesh = new THREE.Mesh(geom, mat)
    mesh.name = this.data.bordername

    self.el.setObject3D(this.data.bordername, mesh)
  },

  updateColor() {
    const self = this
    const data = self.data

    const newColor: number = data.disabled ? data.disabledColor : data.active ? data.activeColor : data.hover ? data.hoverColor : data.color

    const opacity = data.disabled ? data.disabledopacity : data.active || data.hover ? 1 : data.borderbaseopacity
    const transparent = data.disabled ? true : !(data.active || data.hover)

    const meshes = this.data.type === 'border' ? [this.data.bordername] : this.data.meshes
    meshes.forEach(meshName => {
      const mesh = self.el.getObject3D(meshName) as THREE.Mesh
      if (mesh) {
        const mat = mesh.material as THREE.MeshBasicMaterial
        mat.color = new THREE.Color(newColor)
        mat.opacity = opacity
        mat.transparent = transparent
      }
    })
  },

  updateTextColor() {
    const self = this
    const data = self.data

    const newColor = data.disabled ? data.disabledColor : data.active ? data.activeColor : data.hover ? data.hoverColor : data.color
    const txtObj = this.el.getObject3D('text')
    if (txtObj && (txtObj as any).material) {
      (txtObj as any).material.uniforms.color.value = new THREE.Color(newColor)
    }
  },

  handleIntersection(attribute = 'hover') {
    const self = this
    if (!this.intersectingRaycaster) {
      return
    }

    const value = {} as any
    value[attribute] = true
    const intersection = this.intersectingRaycaster.getIntersection(this.el)
    self.intersection = intersection
    if (intersection && !self.data[attribute]) {
      if (self.data.target !== '') {
        switch (intersection.object.name) {
          case self.data.target:
          case this.data.bordername:
            self.el.setAttribute('highlight', value)
            break
          default:
            break
        }
      } else {
        self.el.setAttribute('highlight', value)
      }
    }
  },

  raycasterIntersectedHandler(evt) {
    this.intersectingRaycaster = evt.detail.el.components.raycaster
  },

  raycasterIntersectedClearedHandler(evt) {
    console.debug(evt)
    if (this.intersectingRaycaster != null) {
      const intersection = this.intersectingRaycaster.getIntersection(this.el)
      if (intersection === undefined) {
        this.intersectingRaycaster = null
      } else {
      }
    } else {
      // console.log('self.intersectingRaycaster is null')
    }

    if (this.data.hover) {
      this.el.setAttribute('highlight', { hover: false })
    }
  },

  mousedownHandler(evt) {
    console.debug(evt)
    this.handleIntersection('active')
  },

  mouseupHandler(evt) {
    console.debug(evt)
    if (this.el.getAttribute('highlight').active) {
      this.el.setAttribute('highlight', { active: false })
    }
  }

}

const ComponentSystem = {
  name: ComponentName,
  // system: SystemDef,
  component: Component
  // primitive: Primitive
}

export default ComponentSystem
