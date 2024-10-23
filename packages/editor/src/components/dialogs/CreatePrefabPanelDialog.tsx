/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { PopoverState } from '@ir-engine/client-core/src/common/services/PopoverState'
import { API } from '@ir-engine/common'
import config from '@ir-engine/common/src/config'
import { staticResourcePath } from '@ir-engine/common/src/schema.type.module'
import {
  Entity,
  EntityUUID,
  UUIDComponent,
  entityExists,
  getComponent,
  setComponent,
  useOptionalComponent
} from '@ir-engine/ecs'
import PrefabConfirmationPanelDialog from '@ir-engine/editor/src/components/dialogs/PrefabConfirmationPanelDialog'
import { pathJoin } from '@ir-engine/engine/src/assets/functions/miscUtils'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { GLTFDocumentState } from '@ir-engine/engine/src/gltf/GLTFDocumentState'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { getMutableState, getState, startReactor, useHookstate, useImmediateEffect } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import Input from '@ir-engine/ui/src/primitives/tailwind/Input'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { exportRelativeGLTF } from '../../functions/exportGLTF'
import { EditorState } from '../../services/EditorServices'
import { SelectionState } from '../../services/SelectionServices'

export default function CreatePrefabPanel({ entity }: { entity: Entity }) {
  const defaultPrefabFolder = useHookstate<string>('assets/custom-prefabs')
  const prefabName = useHookstate<string>('prefab')
  const prefabTag = useHookstate<string[]>(['prefab'])
  const { t } = useTranslation()
  const isOverwriteModalVisible = useHookstate(false)
  const isOverwriteConfirmed = useHookstate(false)
  const onExportPrefab = async () => {
    const editorState = getState(EditorState)
    const fileName = defaultPrefabFolder.value + '/' + prefabName.value + '.gltf'
    const srcProject = editorState.projectName!
    const fileURL = pathJoin(config.client.fileServer, 'projects', srcProject, fileName)
    try {
      const parentEntity = getComponent(entity, EntityTreeComponent).parentEntity
      const resourcesold = await API.instance.service(staticResourcePath).find({
        query: { key: 'projects/' + srcProject + '/' + fileName }
      })
      if (resourcesold.data.length !== 0 && !isOverwriteConfirmed.value) {
        console.log('this name already exist, click confirm to overwrite the prefab')
        await isOverwriteModalVisible.set(true)
      } else {
        setComponent(entity, NameComponent, prefabName.value)
        getMutableState(SelectionState).selectedEntities.set([])
        await exportRelativeGLTF(entity, srcProject, fileName)

        const resources = await API.instance.service(staticResourcePath).find({
          query: { key: 'projects/' + srcProject + '/' + fileName }
        })
        if (resources.data.length === 0) {
          throw new Error('User not found')
        }
        const resource = resources.data[0]
        const tags = [...prefabTag.value]
        await API.instance.service(staticResourcePath).patch(resource.id, { tags: tags, project: srcProject })

        EditorControlFunctions.removeObject([entity])
        const sceneID = getComponent(parentEntity, SourceComponent)
        const reactor = startReactor(() => {
          const documentState = useHookstate(getMutableState(GLTFDocumentState))
          const nodes = documentState[sceneID].nodes
          const entityUUIDState = useHookstate<EntityUUID | undefined>(undefined)
          useEffect(() => {
            if (!entityExists(entity) && !entityUUIDState.value) {
              const { entityUUID } = EditorControlFunctions.createObjectFromSceneElement(
                [{ name: GLTFComponent.jsonID, props: { src: fileURL } }],
                parentEntity
              )
              getMutableState(SelectionState).selectedEntities.set([entityUUID])
              entityUUIDState.set(entityUUID)
            } else {
              console.log('Entity not removed')
            }
          }, [nodes])

          const ModelLoadedReactor = (props: { entityUUID: EntityUUID }) => {
            const { entityUUID } = props
            const entity = UUIDComponent.useEntityByUUID(entityUUID)
            const gltfComponent = useOptionalComponent(entity, GLTFComponent)

            useImmediateEffect(() => {
              if (!gltfComponent) return
              const name = prefabName.value
              setComponent(entity, NameComponent, name)

              PopoverState.hidePopupover()
              defaultPrefabFolder.set('assets/custom-prefabs')
              prefabName.set('prefab')
              prefabTag.set([])
              isOverwriteModalVisible.set(false)
              isOverwriteConfirmed.set(false)
              PopoverState.showPopupover(<PrefabConfirmationPanelDialog entity={entity} />)

              reactor.stop()
            }, [gltfComponent])

            return null
          }

          return entityUUIDState.value ? <ModelLoadedReactor entityUUID={entityUUIDState.value} /> : null
        })
      }
    } catch (e) {
      console.error(e)
    }
  }
  return (
    <>
      {!isOverwriteModalVisible.value && !isOverwriteConfirmed.value && (
        <Modal
          title="Create Prefab"
          onSubmit={onExportPrefab}
          className="w-[50vw] max-w-2xl"
          onClose={PopoverState.hidePopupover}
        >
          <Input
            value={defaultPrefabFolder.value}
            onChange={(event) => defaultPrefabFolder.set(event.target.value)}
            label="Default Save Folder"
          />
          <Input
            value={prefabName.value}
            onChange={(event) => prefabName.set(event.target.value)}
            label="Name"
            maxLength={64}
          />

          <Button
            size="small"
            variant="outline"
            className="text-left text-xs"
            onClick={() => {
              prefabTag.set([...(prefabTag.value ?? []), ''])
            }}
          >
            {t('editor:layout.filebrowser.fileProperties.addTag')}
          </Button>
          <div>
            {(prefabTag.value ?? []).map((tag, index) => (
              <div className="ml-4 flex items-end">
                <Input
                  key={index}
                  label={t('editor:layout.filebrowser.fileProperties.tag')}
                  onChange={(event) => {
                    const tags = [...prefabTag.value]
                    tags[index] = event.target.value
                    prefabTag.set(tags)
                  }}
                  value={prefabTag.value[index]}
                  endComponent={
                    <Button
                      onClick={() => {
                        prefabTag.set(prefabTag.value.filter((_, i) => i !== index))
                      }}
                      size="small"
                      variant="outline"
                      className="text-left text-xs"
                    >
                      x
                    </Button>
                  }
                />
              </div>
            ))}
          </div>
        </Modal>
      )}
      {/* Overwrite Confirmation Modal */}
      {isOverwriteModalVisible.value && (
        <Modal
          title="Overwrite Prefab"
          onSubmit={() => {
            isOverwriteConfirmed.set(true)
            isOverwriteModalVisible.set(false)
            onExportPrefab()
          }}
          onClose={() => {
            isOverwriteConfirmed.set(false)
            isOverwriteModalVisible.set(false)
          }}
          className="w-1/3 max-w-md p-4"
        >
          <div className="flex justify-end">
            <p>Prefab with this name already exists. You will overwrite it.</p>
          </div>
        </Modal>
      )}
    </>
  )
}
