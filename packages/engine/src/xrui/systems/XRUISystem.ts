import { defineQuery, defineSystem, System } from 'bitecs'
import { Engine } from '../../ecs/classes/Engine'
import { ECSWorld } from '../../ecs/classes/World'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { XRUIManager } from '../classes/XRUIManager'
import { XRUIComponent } from '../components/XRUIComponent'

export const XRUISystem = async (): Promise<System> => {
  XRUIManager.instance = new XRUIManager(await import('ethereal'))

  const uiQuery = defineQuery([XRUIComponent])

  // const adapterQuery = defineQuery([Object3DComponent, XRUIAdapterComponent])
  // const adapterAddQuery = enterQuery(adapterQuery)

  return defineSystem((world: ECSWorld) => {
    const interactionRays = []

    for (const entity of uiQuery(world)) {
      const layer = getComponent(entity, XRUIComponent).layer
      layer.interactionRays = interactionRays
      if (!XRUIManager.instance.layoutSystem.nodeAdapters.has(layer)) layer.update()
    }

    // for (const entity of adapterAddQuery(world)) {
    //   const xrui = getComponent(entity, XRUIComponent)
    //   const object = Object3DComponent.get(entity).value
    //   const adapter = XRUIManager.instance.layoutSystem.getAdapter(object)
    //   adapter.onUpdate = () => {
    //     if (xrui) xrui.layer.update()
    //   }
    // }

    XRUIManager.instance.layoutSystem.viewFrustum.setFromPerspectiveProjectionMatrix(Engine.camera.projectionMatrix)
    Engine.renderer.getSize(XRUIManager.instance.layoutSystem.viewResolution)
    XRUIManager.instance.layoutSystem.update(world.delta, world.elapsedTime)

    return world
  })
}
