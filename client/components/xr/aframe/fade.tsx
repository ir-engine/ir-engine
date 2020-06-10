import AFRAME from 'aframe'
import PropertyMapper from './ComponentUtils'

export const ComponentName = 'fade'

export interface Data {
  [key: string]: any,
  fadeInEvent: string,
  fadeOutEvent: string,
  dur: number,
  animate: boolean
}

export const ComponentSchema: AFRAME.MultiPropertySchema<Data> = {
  fadeInEvent: { type: 'string', default: 'trigger-fade-in' },
  fadeOutEvent: { type: 'string', default: 'trigger-fade-out' },
  dur: { type: 'number', default: 1 },
  animate: { type: 'boolean', default: true }
}

export interface Props {
  initSomething: () => void,
  addHandlers: () => void,
  removeHandlers: () => void,
  aHandler: () => void,
  gatherMeshes: (object3D: THREE.Object3D) => THREE.Mesh[],
  createOpacityMap: (meshes: THREE.Mesh[]) => Map<any, any>,
  map: Map<any, any>,
  meshes: THREE.Mesh[],
  animateFadeOutPromise: () => Promise<any>,
  animateFadeInPromise: () => Promise<any>,
  fadeOutPromise: Promise<any>,
  fadeInPromise: Promise<any>
}

export const Component: AFRAME.ComponentDefinition<Props> = {
  schema: ComponentSchema,
  data: {
  } as Data,

  map: null,
  meshes: null,
  fadeOutPromise: null,
  fadeInPromise: null,

  init () {
    if (this.el.sceneEl?.hasLoaded) this.initSomething()
    else this.el.sceneEl?.addEventListener('loaded', this.initSomething.bind(this))
  },

  play() {
    this.addHandlers()
  },

  pause() {
    this.removeHandlers()
  },

  update(oldData: Data) {
    const changedData = Object.keys(this.data).filter(x => this.data[x] !== oldData[x])
    if (changedData.includes('someData')) {
      // update something
    }
    // multiple data
    if (['someData', 'otherData'].some(prop => changedData.includes(prop))) {
      // update
    }
  },

  initSomething() {
  },

  gatherMeshes(object3D) {
    const self = this
    const meshes = []
    if (object3D.type === 'Mesh') { return [object3D] }

    if (object3D.children) {
      object3D.children.forEach((obj) => {
        const result = self.gatherMeshes(obj)
        if (result) {
          if (result instanceof Array) {
            result.forEach((mesh) => meshes.push(mesh))
          } else {
            meshes.push(result)
          }
        }
      })
    }
    return meshes
  },

  createOpacityMap(meshes) {
    const map = new Map()
    meshes.forEach(mesh => {
      const opacity = (mesh.material as THREE.MeshBasicMaterial).opacity
      const transparency = (mesh.material as THREE.MeshBasicMaterial).transparent
      map.set(mesh, { opacity: opacity, transparency: transparency })
    })
    return map
  },

  async animateFadeOutPromise() {
    const self = this
    const el = this.el

    if (this.fadeOutPromise) {
      await this.fadeOutPromise
    }
    if (this.fadeInPromise) {
      await this.fadeInPromise
    }

    const result = self.gatherMeshes(el.object3D)
    self.meshes = result
    this.map = self.createOpacityMap(self.meshes)

    const promise = new Promise((resolve, reject) => {
      try {
        result.forEach((mesh) => {
          if (this.data.animate) {
            (AFRAME as any).ANIME({
              targets: mesh.material,
              easing: 'linear',
              opacity: 0,
              duration: self.data.dur * 1000,
              begin: function() {
                mesh.material.transparent = true
              },
              complete: function() {
                mesh.visible = false
                mesh.updateMatrix()
                mesh.updateMatrixWorld()
                resolve()
              }
            })
          } else {
            mesh.material.transparent = true
            mesh.visible = false
            mesh.updateMatrix()
            mesh.updateMatrixWorld()
          }
        })
        if (this.data.animate) {
          (AFRAME as any).ANIME({
            targets: el,
            easing: 'linear',
            duration: self.data.dur * 1000,
            complete: function() {
              resolve()
            }
          })
        } else {
          resolve()
        }
      } catch (error) {
        console.error('animateFadeOutPromise error')
        console.log(error)
        reject(error)
      }
    })

    this.fadeOutPromise = promise

    return promise
  },

  async animateFadeInPromise() {
    const self = this
    const el = self.el

    if (this.fadeInPromise) {
      await this.fadeInPromise
    }
    if (this.fadeOutPromise) {
      await this.fadeOutPromise
    }

    const result = self.gatherMeshes(el.object3D)

    const promise = new Promise((resolve, reject) => {
      try {
        result.forEach((mesh) => {
          if (this.data.animate) {
            (AFRAME as any).ANIME({
              targets: mesh.material,
              easing: 'linear',
              opacity: !!self.map && self.map.has(mesh) ? self.map.get(mesh).opacity : 1,
              duration: self.data.dur * 1000,
              begin: function() {
                mesh.visible = true
              },
              complete: function() {
                mesh.material.transparent = !!self.map && self.map.has(mesh)
                  ? self.map.get(mesh).transparency : false
                resolve()
              }
            })
          } else {
            mesh.visible = true
            mesh.material.transparent = !!self.map && self.map.has(mesh)
              ? self.map.get(mesh).transparency : false
          }
        })
        if (this.data.animate) {
          (AFRAME as any).ANIME({
            targets: el,
            easing: 'linear',
            duration: self.data.dur * 1000,
            complete: function() {
              resolve()
            }
          })
        } else {
          resolve()
        }
      } catch (error) {
        console.error('animateFadeInPromise error')
        console.log(error)
        reject(error)
      }
    })

    this.fadeInPromise = promise

    return promise
  },

  aHandler() {

  },

  addHandlers: function() {
    this.el.addEventListener(this.data.fadeInEvent, this.animateFadeInPromise.bind(this))
    this.el.addEventListener(this.data.fadeOutEvent, this.animateFadeOutPromise.bind(this))
  },

  removeHandlers: function() {
    this.el.removeEventListener('an-event', this.aHandler)
  }

}

const primitiveProps = ['fadeInEvent', 'fadeOutEvent', 'dur', 'animate']

export const Primitive: AFRAME.PrimitiveDefinition = {
  defaultComponents: {
    ComponentName: {}
  },
  deprecated: false,
  mappings: {
    ...PropertyMapper(primitiveProps, ComponentName)
  }
}

const ComponentSystem = {
  name: ComponentName,
  // system: SystemDef,
  component: Component,
  primitive: Primitive
}

export default ComponentSystem
