import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EngineRenderer } from '@xrengine/engine/src/renderer/WebGLRendererSystem'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { Effects } from '@xrengine/engine/src/scene/constants/PostProcessing'

import { accessSelectionState } from '../services/SelectionServices'

export const updateOutlinePassSelection = (): void => {
  if (!EngineRenderer.instance.effectComposer || !EngineRenderer.instance.effectComposer[Effects.OutlineEffect]) return

  const meshes = [] as any[]
  const parentEntities = accessSelectionState().selectedParentEntities.value
  for (let i = 0; i < parentEntities.length; i++) {
    const obj3d = getComponent(parentEntities[i], Object3DComponent)?.value
    obj3d?.traverse((child: any) => {
      if (
        !child.userData.disableOutline &&
        !child.userData.isHelper &&
        (child.isMesh || child.isLine || child.isSprite || child.isPoints)
      ) {
        meshes.push(child)
      }
    })
  }

  EngineRenderer.instance.effectComposer[Effects.OutlineEffect].selection.set(meshes)
}
