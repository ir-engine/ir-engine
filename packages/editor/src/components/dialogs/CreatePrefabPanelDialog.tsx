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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import { API } from '@ir-engine/common'
import config from '@ir-engine/common/src/config'
import { staticResourcePath } from '@ir-engine/common/src/schema.type.module'
import { isValidFileName } from '@ir-engine/common/src/utils/validateFileName'
import {
  Component,
  createEntity,
  Entity,
  EntityID,
  EntityTreeComponent,
  getComponent,
  hasComponent,
  iterateEntityNode,
  removeEntity,
  setComponent,
  SourceID,
  useOptionalComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import PrefabConfirmationPanelDialog from '@ir-engine/editor/src/components/dialogs/PrefabConfirmationPanelDialog'
import { pathJoin } from '@ir-engine/engine/src/assets/functions/miscUtils'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { SkyboxComponent } from '@ir-engine/engine/src/scene/components/SkyboxComponent'
import { getMutableState, getState, NO_PROXY, none, startReactor, useHookstate } from '@ir-engine/hyperflux'
import { DirectionalLightComponent, HemisphereLightComponent, TransformComponent } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { PostProcessingComponent } from '@ir-engine/spatial/src/renderer/components/PostProcessingComponent'
import { Button, Input } from '@ir-engine/ui'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import { uniqueId } from 'lodash'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineXMark } from 'react-icons/hi2'
import { Quaternion, Scene, Vector3 } from 'three'
import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { exportRelativeGLTF } from '../../functions/exportGLTF'
import { EditorState } from '../../services/EditorServices'
import { ImportSettingsState } from '../../services/ImportSettingsState'
import { SelectionState } from '../../services/SelectionServices'

type PrefabTagType = Readonly<{
  id: string
  value: string
}>

export default function CreatePrefabPanel({ entity, isExportLookDev }: { entity?: Entity; isExportLookDev?: boolean }) {
  const isLoading = useHookstate(false)
  const importFolder = getMutableState(ImportSettingsState).importFolder.get(NO_PROXY)
  const defaultPrefabFolder = useHookstate<string>('custom-prefabs')
  const prefabName = useHookstate<string>('prefab')
  const resultFileName = useHookstate(isValidFileName(prefabName.value))
  const prefabTag = useHookstate<PrefabTagType[]>([{ id: uniqueId('tag-'), value: 'prefab' }])
  const { t } = useTranslation()
  const isOverwriteModalVisible = useHookstate(false)
  const isOverwriteConfirmed = useHookstate(false)

  const finishSavePrefab = () => {
    ModalState.closeModal()
    defaultPrefabFolder.set('custom-prefabs')
    prefabName.set('prefab')
    prefabTag.set([])
    isOverwriteModalVisible.set(false)
    isOverwriteConfirmed.set(false)
    ModalState.openModal(<PrefabConfirmationPanelDialog />)
  }

  const exportLookDevPrefab = async (srcProject: string, fileName: string) => {
    const lookDevComponent: Component[] = [
      SkyboxComponent,
      HemisphereLightComponent,
      DirectionalLightComponent,
      PostProcessingComponent
    ]

    const prefabEntity = createEntity()
    const sceneObject = new Scene()

    setComponent(prefabEntity, UUIDComponent, {
      entitySourceID: UUIDComponent.generate() as string as SourceID,
      entityID: 'temp-prefab' as EntityID
    })
    setComponent(prefabEntity, ObjectComponent, sceneObject)
    setComponent(prefabEntity, NameComponent, 'temp prefab')

    const rootEntity = getState(EditorState).rootEntity

    iterateEntityNode(rootEntity, (entity) => {
      lookDevComponent.forEach((component) => {
        if (hasComponent(entity, component)) {
          const componentData = getComponent(entity, component)
          setComponent(prefabEntity, component, componentData)
        }
      })
    })

    getMutableState(SelectionState).selectedEntities.set([])

    await exportRelativeGLTF(prefabEntity, srcProject, fileName)

    const resourcePath = `projects/${srcProject}${fileName}`
    const resources = await API.instance.service(staticResourcePath).find({
      query: { key: resourcePath }
    })

    if (resources.data.length === 0) {
      throw new Error('Resource not found')
    }

    const resource = resources.data[0]
    const tags = [...prefabTag.value.map(({ value }) => value), 'Lookdev']

    await API.instance.service(staticResourcePath).patch(resource.id, { tags: tags, project: srcProject })

    removeEntity(prefabEntity)
    finishSavePrefab()
  }

  const exportPrefab = async (entity: Entity, srcProject: string, fileName: string, fileURL: string) => {
    const parentEntity = getComponent(entity, EntityTreeComponent).parentEntity
    setComponent(entity, NameComponent, prefabName.value)
    getMutableState(SelectionState).selectedEntities.set([])

    const transform = getComponent(entity, TransformComponent)
    const position = transform.position.clone()
    const rotation = transform.rotation.clone()

    setComponent(entity, TransformComponent, {
      position: new Vector3(0, 0, 0),
      rotation: new Quaternion().identity(),
      scale: new Vector3(1, 1, 1)
    })
    await exportRelativeGLTF(entity, srcProject, fileName)

    const resources = await API.instance.service(staticResourcePath).find({
      query: { key: `projects/${srcProject}${fileName}` }
    })
    if (resources.data.length === 0) {
      throw new Error('User not found')
    }
    const resource = resources.data[0]
    const tags = prefabTag.value.map(({ value }) => value)
    await API.instance.service(staticResourcePath).patch(resource.id, { tags: tags, project: srcProject })

    EditorControlFunctions.removeObject([entity])
    const { entityUUID } = EditorControlFunctions.createObjectFromSceneElement(
      [
        { name: GLTFComponent.jsonID, props: { src: fileURL } },
        { name: TransformComponent.jsonID, props: { position, rotation } }
      ],
      parentEntity
    )
    getMutableState(SelectionState).selectedEntities.set([entityUUID])
    const reactor = startReactor(() => {
      const entity = UUIDComponent.useEntityByUUID(entityUUID)
      const gltfComponent = useOptionalComponent(entity, GLTFComponent)

      useEffect(() => {
        if (!gltfComponent) return
        const name = prefabName.value
        setComponent(entity, NameComponent, name)
        finishSavePrefab()
        reactor.stop()
      }, [gltfComponent])

      return null
    })
  }

  const onExportPrefab = async () => {
    isLoading.set(true)
    const editorState = getState(EditorState)
    const baseFileName = `${importFolder}${defaultPrefabFolder.value}/${prefabName.value}`
    const fileName = isExportLookDev ? `${baseFileName}.lookdev.gltf` : `${baseFileName}.gltf`
    const srcProject = editorState.projectName!
    const fileURL = pathJoin(config.client.fileServer, 'projects', srcProject, fileName)

    try {
      const resourcePath = `projects/${srcProject}${fileName}`
      const resourcesOld = await API.instance.service(staticResourcePath).find({
        query: { key: resourcePath }
      })

      const prefabExits = resourcesOld.data.length !== 0

      if (prefabExits && !isOverwriteConfirmed.value) {
        console.log('This name already exist, click confirm to overwrite the prefab')
        await isOverwriteModalVisible.set(true)
        return
      }

      if (isExportLookDev) {
        await exportLookDevPrefab(srcProject, fileName)
      } else {
        if (!entity) return

        await exportPrefab(entity, srcProject, fileName, fileURL)
      }

      NotificationService.dispatchNotify(t('editor:prefab.exportedSuccess'), { variant: 'success' })
    } catch (error) {
      console.error(error)
      NotificationService.dispatchNotify(error.message, { variant: 'error' })
    } finally {
      isLoading.set(false)
    }
  }

  return (
    <>
      {!isOverwriteModalVisible.value && !isOverwriteConfirmed.value && (
        <Modal
          title={isExportLookDev ? t('editor:prefab.createLookdevTitle') : t('editor:prefab.createTitle')}
          onSubmit={onExportPrefab}
          className="w-[50vw] max-w-2xl"
          onClose={ModalState.closeModal}
          submitButtonDisabled={!resultFileName.value.isValid}
          closeButtonText={t('common:components.close')}
          submitLoading={isLoading.value}
        >
          <div className="flex flex-col gap-4">
            <Input
              fullWidth
              value={defaultPrefabFolder.value}
              onChange={(event) => defaultPrefabFolder.set(event.target.value)}
              labelProps={{
                text: t('editor:prefab.defaultSaveFolder'),
                position: 'top'
              }}
            />
            <Input
              fullWidth
              value={prefabName.value}
              onChange={(event) => {
                resultFileName.set(isValidFileName(event.target.value))
                prefabName.set(event.target.value)
              }}
              labelProps={{
                text: t('editor:prefab.name'),
                position: 'top'
              }}
              minLength={4}
              maxLength={64}
              state={!resultFileName.value.isValid ? 'error' : undefined}
              helperText={!resultFileName.value.isValid ? resultFileName.value.error : undefined}
            />
            {!isExportLookDev && (
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="tertiary"
                  className="text-left text-xs"
                  onClick={() => {
                    prefabTag.merge([{ id: uniqueId('tag-'), value: '' }])
                  }}
                >
                  {t('editor:layout.filebrowser.fileProperties.addTag')}
                </Button>
                {(prefabTag.value ?? []).map((tag, index) => (
                  <Input
                    fullWidth
                    key={tag.id}
                    labelProps={{
                      text: t('editor:layout.filebrowser.fileProperties.tag'),
                      position: 'top'
                    }}
                    onChange={(event) => {
                      prefabTag[index].set({ id: tag.id, value: event.target.value })
                    }}
                    value={tag.value}
                    endComponent={
                      <Button
                        onClick={() => {
                          prefabTag[index].set(none)
                        }}
                        size="sm"
                        variant="tertiary"
                        className="text-xs"
                      >
                        <HiOutlineXMark />
                      </Button>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
      {/* Overwrite Confirmation Modal */}
      {isOverwriteModalVisible.value && (
        <Modal
          title={t('editor:prefab.alreadyExistsTitle')}
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
          <div className="flex justify-center">
            <p>{t('editor:prefab.alreadyExists')}</p>
          </div>
        </Modal>
      )}
    </>
  )
}
