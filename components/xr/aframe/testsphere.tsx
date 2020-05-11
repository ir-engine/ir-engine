import AFRAME from 'aframe'
const THREE = AFRAME.THREE

export const name = 'mysphere'

export interface Data {
    radius: number
}

export const Schema: AFRAME.Schema<Data> = {
}

export const SystemDef: AFRAME.SystemDefinition = {
  schema: Schema,
  data: {
    radius: 5
  } as Data,

  init () {
  },

  play() {
  },

  pause() {
  }

}

export const ComponentDef: AFRAME.ComponentDefinition = {
  schema: Schema,
  data: {
    radius: 5
  } as Data,

  init () {
    const geom = new THREE.SphereBufferGeometry(this.data.radius)
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('blue'),
      side: THREE.DoubleSide
    })
    const mesh = new THREE.Mesh(geom, mat)
    this.el.setObject3D('mesh', mesh)
  },

  play() {
  },

  pause() {
  }

}

export const PrimitiveDef: AFRAME.PrimitiveDefinition = {
  defaultComponents: {
    name: {}
  },
  deprecated: false,
  mappings: {
    radius: name + '.radius'
  }
}

const ComponentSystem = {
  name: name,
  system: SystemDef,
  component: ComponentDef,
  primitive: PrimitiveDef
}

export default ComponentSystem
