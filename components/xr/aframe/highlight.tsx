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

  disabledopacity: { default: 0.2 },

  createborder: { default: false },
  bordername: { default: 'border' }
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
  updateColor: (meshName: string) => void,
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

  tick: function() {
    this.handleIntersection('hover')
  },

  update(oldData: Data) {
    var data = this.data
    var changedData = Object.keys(this.data).filter(x => this.data[x] !== oldData[x])

    if (changedData.includes('disabled')) {
      this.el.setAttribute('highlight', { hover: false, active: false })
    }

    if (['hover', 'active', 'disabled'].some(prop => changedData.includes(prop))) {
      if (data.type === 'color') {
        this.updateColor('mesh')
      } else if (data.type === 'text') {
        this.updateTextColor()
      } else if (data.type === 'border' && this.el.object3DMap.hasOwnProperty(this.data.bordername)) {
        this.updateColor(this.data.bordername)
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
    var self = this
    var data = self.data

    var geomAttribute

    if (data.target === '') {
      geomAttribute = self.el.getAttribute('geometry')
    } else {
      // eslint-disable-next-line no-prototype-builtins
      if (self.el.object3DMap.hasOwnProperty(data.target)) {
        var geo = (self.el.getObject3D(data.target) as THREE.Mesh).geometry
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
    var self = this
    var data = self.data

    var borderGeomAttribute = Object.assign({}, geomAttribute)
    borderGeomAttribute.radius = borderGeomAttribute.radius * (1 + data.bordersize)
    // (this.system as AFRAME.SystemDefinition<MediaCellSystemProps>)
    var geom = (self.el.sceneEl?.systems.geometry as any).getOrCreateGeometry(borderGeomAttribute)

    var color = data.active ? data.activeColor : data.hover ? data.hoverColor : data.color

    var opacity = data.active || data.hover ? 1 : data.borderbaseopacity
    var transparent = !(data.active || data.hover)

    var mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      side: THREE.BackSide,
      opacity: opacity,
      transparent: transparent
    })
    var newMesh = new THREE.Mesh(geom, mat)
    newMesh.name = this.data.bordername
    newMesh.updateMatrix()

    self.el.setObject3D(this.data.bordername, newMesh)
  },

  createBorderPlane(geomAttribute) {
    var self = this
    var data = Object.assign({}, self.data)

    var mat, mesh

    var borderGeomAttribute = Object.assign({}, geomAttribute)
    borderGeomAttribute.width = borderGeomAttribute.width * (1 + data.bordersize)
    borderGeomAttribute.height = borderGeomAttribute.height * (1 + data.bordersize)
    var cache = (self.el.sceneEl?.systems.geometry as any).cache
    var hash = (self.el.sceneEl?.systems.geometry as any).hash(borderGeomAttribute)
    var isCached = !!cache[hash]
    var geom = (self.el.sceneEl?.systems.geometry as any).getOrCreateGeometry(borderGeomAttribute)
    if (!isCached) {
      geom.translate(0, 0, -0.001)
    }

    var color = data.active ? data.activeColor : data.hover ? data.hoverColor : data.color

    var opacity = data.active || data.hover ? 1 : data.borderbaseopacity
    var transparent = !(data.active || data.hover)

    mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      side: THREE.FrontSide,
      opacity: opacity,
      transparent: transparent
    })
    mesh = new THREE.Mesh(geom, mat)
    mesh.name = this.data.bordername

    self.el.setObject3D(this.data.bordername, mesh)
  },

  updateColor(meshName = 'mesh') {
    var self = this
    var data = self.data

    var newColor: number = data.disabled ? data.disabledColor : data.active ? data.activeColor : data.hover ? data.hoverColor : data.color

    var opacity = data.disabled ? data.disabledopacity : data.active || data.hover ? 1 : data.borderbaseopacity
    var transparent = data.disabled ? true : !(data.active || data.hover)

    var mesh = self.el.getObject3D(meshName) as THREE.Mesh
    if (mesh) {
      const mat = mesh.material as THREE.MeshBasicMaterial
      mat.color = new THREE.Color(newColor)
      mat.opacity = opacity
      mat.transparent = transparent
    }
  },

  updateTextColor() {
    var self = this
    var data = self.data

    var newColor = data.disabled ? data.disabledColor : data.active ? data.activeColor : data.hover ? data.hoverColor : data.color
    var txtObj = this.el.getObject3D('text')
    if (txtObj && (txtObj as any).material) {
      (txtObj as any).material.uniforms.color.value = new THREE.Color(newColor)
    }
  },

  handleIntersection(attribute = 'hover') {
    var self = this
    if (!this.intersectingRaycaster) {
      return
    }

    var value = {} as any
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

export const Primitive: AFRAME.PrimitiveDefinition = {
  defaultComponents: {
    ComponentName: {}
  },
  deprecated: false,
  mappings: {
    id: ComponentName + '.id',
    'some-date': ComponentName + '.someData'
  }
}

const ComponentSystem = {
  name: ComponentName,
  // system: SystemDef,
  component: Component,
  primitive: Primitive
}

export default ComponentSystem
