import { PopoverState } from '@ir-engine/client-core/src/common/services/PopoverState'
import { getComponent, hasComponent } from '@ir-engine/ecs'
import { STATIC_ASSET_REGEX } from '@ir-engine/engine/src/assets/functions/pathResolver'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { getState, useHookstate } from '@ir-engine/hyperflux'
import { Input } from '@ir-engine/ui'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import React from 'react'
import { exportRelativeGLTF } from '../../functions/exportGLTF'
import { EditorState } from '../../services/EditorServices'

export default function SavePrefabPanel({ entity }) {
  if (!hasComponent(entity, GLTFComponent))
    throw new Error('Cannot save a prefab that has no GLTF Component on root entity')
  const gltfComponent = getComponent(entity, GLTFComponent)
  const srcPath = useHookstate(STATIC_ASSET_REGEX.exec(gltfComponent.src)?.[3].replace(/\.[^.]*$/, ''))

  const onSavePrefab = async () => {
    const isGLTF = gltfComponent.src.endsWith('gltf')
    const saveName = srcPath.value + '.gltf'
    await exportRelativeGLTF(entity, getState(EditorState).projectName!, saveName, false)
    PopoverState.hidePopupover()
  }

  return (
    <Modal
      title="Save Prefab"
      onSubmit={onSavePrefab}
      className="w-[50vw] max-w-2xl"
      onClose={PopoverState.hidePopupover}
    >
      <Input
        value={srcPath.value}
        onChange={(event) => srcPath.set(event.target.value)}
        labelProps={{
          text: 'Save Path',
          position: 'top'
        }}
      />
    </Modal>
  )
}
