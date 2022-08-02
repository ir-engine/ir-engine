import { WebContainer3D, WebLayerManager } from '@etherealjs/web-layer/three'
import { State } from '@hookstate/core'
import React from 'react'
import { Object3D, Vector3 } from 'three'

import { createObjectPool } from '../../common/functions/ObjectPool'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { VisibleComponent } from '../../scene/components/VisibleComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import { XRUIComponent } from '../components/XRUIComponent'
import { XRUIStateContext } from '../XRUIStateContext'

let Ethereal: typeof import('@etherealjs/web-layer/three')
let ReactDOM: typeof import('react-dom')

export async function loadXRUIDeps() {
  ;[Ethereal, ReactDOM] = await Promise.all([import('@etherealjs/web-layer/three'), import('react-dom')])
}

function createWebContainer<S extends State<any> | null>(
  UI: React.FC,
  state: S,
  options: import('@etherealjs/web-layer/three').WebContainer3DOptions
) {
  const containerElement = document.createElement('div')
  containerElement.style.position = 'fixed'
  containerElement.id = 'xrui-' + UI.name

  ReactDOM.render(
    //@ts-ignore
    <XRUIStateContext.Provider value={state}>
      <UI />
    </XRUIStateContext.Provider>,
    containerElement
  )

  options.autoRefresh = options.autoRefresh ?? true
  return new Ethereal.WebContainer3D(containerElement, options)
}

export function createXRUI<S extends State<any> | null>(UIFunc: React.FC, state = null as S): XRUI<S> {
  const entity = createEntity()

  const container = createWebContainer(UIFunc, state, {
    manager: WebLayerManager.instance
  })

  container.raycaster.layers.enableAll()

  addComponent(entity, Object3DComponent, { value: container })
  setObjectLayers(container, ObjectLayers.UI)
  addComponent(entity, XRUIComponent, { container: container })
  addComponent(entity, VisibleComponent, true)

  return { entity, state, container }
}

export interface XRUI<S> {
  entity: Entity
  state: S
  container: WebContainer3D
}

export function createXRUIPool(
  create: (entity: Entity) => () => ReturnType<typeof createXRUI>,
  onShown: (entity: Entity, xrui: ReturnType<typeof createXRUI>) => void,
  onHidden: (entity: Entity, xrui: ReturnType<typeof createXRUI>) => void,
  count = 3
) {
  const object3Ds = [] as Object3D[]
  let closestObjects = [] as Array<Object3D>
  let displayedObjects = [] as Array<Object3D>

  const xruiObjectPool = createObjectPool<ReturnType<typeof createXRUI>>()
  const xruiCreateMap = new Map<Object3D, Entity>()

  const vec3 = new Vector3()

  const update = () => {
    // calculate distance
    for (const obj of object3Ds) {
      obj.getWorldPosition(vec3)
      const distanceToCamera = Engine.instance.currentWorld.camera.position.distanceTo(vec3)
      obj.userData.distance = distanceToCamera
    }

    // sort based on distance
    object3Ds.sort((a, b) => a.userData.distance - b.userData.distance)
    const removeList = [] as Object3D[]
    closestObjects = object3Ds.slice(0, count)

    // find objects no longer in distance
    for (const obj of displayedObjects) {
      if (
        !closestObjects.find((n) => n === obj)
        //  || obj.userData.distance > args.maxDistance // TODO
      )
        removeList.push(obj)
    }

    // hide objects no longer in distance
    for (const obj of removeList) {
      displayedObjects.splice(displayedObjects.indexOf(obj), 1)
      xruiObjectPool.recycle(obj.userData.xrui)
      const { container } = getComponent(obj.userData.xrui.entity, XRUIComponent)
      onHidden(xruiCreateMap.get(obj)!, obj.userData.xrui)
      container.userData.node = undefined
      obj.userData.xrui = undefined
    }

    // add closests objects not in the pool to the pool
    for (const obj of closestObjects) {
      if (!obj.userData.xrui) {
        const entity = xruiCreateMap.get(obj)!
        const xrui = xruiObjectPool.use(create(entity))
        obj.userData.xrui = xrui
        if (hasComponent(xrui.entity, XRUIComponent)) {
          const { container } = getComponent(xrui.entity, XRUIComponent)
          container.userData.node = obj
          onShown(entity, obj.userData.xrui)
        }
        displayedObjects.push(obj)
      }
    }
    WebLayerManager.instance.serializeQueue.sort((a, b) => {
      const aNode = WebLayerManager.instance.layersByElement.get(a.layer.element)?.userData.node
      const bNode = WebLayerManager.instance.layersByElement.get(b.layer.element)?.userData.node
      if (!aNode || !bNode) return 0
      return aNode - bNode
    })
  }

  const addObject = (entity: Entity) => {
    const obj = getComponent(entity, Object3DComponent).value
    object3Ds.push(obj)
    xruiCreateMap.set(obj, entity)
  }

  const removeObject = (obj: Object3D) => {
    object3Ds.splice(object3Ds.indexOf(obj), 1)
    xruiCreateMap.delete(obj)
  }

  return {
    update,
    addObject,
    removeObject
  }
}
