import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { Effects } from '@xrengine/engine/src/scene/constants/PostProcessing'

import { accessSelectionState } from '../services/SelectionServices'

export const updateOutlinePassSelection = (): void => {
  if (!Engine.effectComposer || !Engine.effectComposer[Effects.OutlineEffect]) return

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

  Engine.effectComposer[Effects.OutlineEffect].selection.set(meshes)
}
