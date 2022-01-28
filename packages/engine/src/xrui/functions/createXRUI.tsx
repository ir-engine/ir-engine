import React from 'react'
import { State } from '@speigg/hookstate'
import { addComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { XRUIComponent } from '../components/XRUIComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { Entity } from '../../ecs/classes/Entity'
import { XRUIStateContext } from '../XRUIStateContext'
import { Engine } from '../../ecs/classes/Engine'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import { WebLayer3D, WebLayerManager } from '@etherealjs/web-layer/three'

let depsLoaded: Promise<[typeof import('@etherealjs/web-layer/three'), typeof import('react-dom')]>

async function createWebContainer<S extends State<any> | null>(
  UI: React.FC,
  state: S,
  options: import('@etherealjs/web-layer/three').WebContainer3DOptions
) {
  const [Ethereal, ReactDOM] = await (depsLoaded =
    depsLoaded || Promise.all([import('@etherealjs/web-layer/three'), import('react-dom')]))

  const containerElement = document.createElement('div')
  containerElement.style.position = 'fixed'

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

  const layersRemaining = new Set<WebLayer3D>()

  let intervalHandle: number

  const ready = new Promise<void>((resolve, reject) => {
    createWebContainer(UIFunc, state, {
      manager: WebLayerManager.instance,
      onLayerPaint: (layer) => {
        Engine.renderer.initTexture(layer.currentTexture!)
        ;(layer.contentMesh.material as THREE.MeshBasicMaterial).toneMapped = false
        layersRemaining.delete(layer)
        if (layersRemaining.size === 0) {
          clearInterval(intervalHandle)
          resolve()
        }
      }
    })
      .then((container) => {
        // Make sure entity still exists, since we are adding these components asynchronously,
        // and bad things might happen if we add these components after entity has been removed
        // TODO: revise this pattern after refactor
        if (!Engine.currentWorld.entityQuery().includes(entity)) {
          console.warn('XRUI layer initialized after entity removed from world')
          return
        }
        addComponent(entity, Object3DComponent, { value: container })
        setObjectLayers(container, ObjectLayers.Render, ObjectLayers.UI)
        addComponent(entity, XRUIComponent, { container: container })

        container.rootLayer.traverseLayersPreOrder((layer) => {
          if (layer.bounds.width * layer.bounds.height > 0) layersRemaining.add(layer)
        })

        intervalHandle = setInterval(() => {
          container.update()
        }, 20) as any
      })
      .catch((err: any) => {
        reject(err)
      })
  })

  return { entity, state, ready }
}

export interface XRUI<S> {
  entity: Entity
  state: S
  ready: Promise<void>
}
