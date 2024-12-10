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

import { ProjectState } from '@ir-engine/client-core/src/common/services/ProjectService'
import config from '@ir-engine/common/src/config'
import { camelCaseToSpacedString } from '@ir-engine/common/src/utils/camelCaseToSpacedString.ts'
import { hasComponent, useComponent } from '@ir-engine/ecs'
import ErrorPopUp from '@ir-engine/editor/src/components/popup/ErrorPopUp'
import { EditorComponentType, commitProperty } from '@ir-engine/editor/src/components/properties/Util'
import { exportRelativeGLTF } from '@ir-engine/editor/src/functions/exportGLTF'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { EditorState } from '@ir-engine/editor/src/services/EditorServices'
import { pathJoin } from '@ir-engine/engine/src/assets/functions/miscUtils'
import { STATIC_ASSET_REGEX } from '@ir-engine/engine/src/assets/functions/pathResolver'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { ErrorComponent } from '@ir-engine/engine/src/scene/components/ErrorComponent'
import { getState, useHookstate } from '@ir-engine/hyperflux'
import { supportedColliderShapes } from '@ir-engine/spatial/src/physics/components/ColliderComponent.tsx'
import { Shapes } from '@ir-engine/spatial/src/physics/types/PhysicsTypes.ts'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent.ts'
import {
  useAncestorWithComponents,
  useChildrenWithComponents
} from '@ir-engine/spatial/src/transform/components/EntityTree.tsx'
import { Checkbox } from '@ir-engine/ui'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { IoIosArrowBack, IoIosArrowDown } from 'react-icons/io'
import { MdOutlineViewInAr } from 'react-icons/md'
import Accordion from '../../../../../primitives/tailwind/Accordion'
import Button from '../../../../../primitives/tailwind/Button'
import LoadingView from '../../../../../primitives/tailwind/LoadingView'
import Text from '../../../../../primitives/tailwind/Text'
import InputGroup from '../../../input/Group'
import ModelInput from '../../../input/Model'
import SelectInput from '../../../input/Select'
import StringInput from '../../../input/String'

import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions.ts'
import { SelectionState } from '@ir-engine/editor/src/services/SelectionServices.ts'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent.ts'
import { HiPlus } from 'react-icons/hi2'

const shapeTypeOptions = Object.entries(Shapes)
  .filter(([_, value]) => supportedColliderShapes.includes(value as any))
  .map(([label, value]) => ({
    label: camelCaseToSpacedString(label),
    value
  }))

const GLTFNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const gltfComponent = useComponent(props.entity, GLTFComponent)
  const exporting = useHookstate(false)
  const editorState = getState(EditorState)
  const projectState = getState(ProjectState)
  const loadedProjects = useHookstate(() => projectState.projects.map((project) => project.name))
  const hasRigidBody = useAncestorWithComponents(props.entity, [RigidBodyComponent])

  const childMeshEntities = useChildrenWithComponents(props.entity, [MeshComponent])
  const isMeshOrConvexHull =
    gltfComponent.shape.value === Shapes.Mesh || gltfComponent.shape.value === Shapes.ConvexHull
  const validRootMesh = hasComponent(props.entity, MeshComponent)
  const validChildMeshes = childMeshEntities.length !== 0
  const showMeshError = isMeshOrConvexHull && !(validChildMeshes || validRootMesh)

  const errors = ErrorComponent.useComponentErrors(props.entity, GLTFComponent)?.value
  const srcProject = useHookstate(() => {
    const match = STATIC_ASSET_REGEX.exec(gltfComponent.src.value)
    if (!match?.length) return editorState.projectName!
    const [_, orgName, projectName] = match
    return `${orgName}/${projectName}`
  })

  const getRelativePath = useCallback(() => {
    const relativePath = STATIC_ASSET_REGEX.exec(gltfComponent.src.value)?.[3]
    if (!relativePath) {
      return 'assets/new-model'
    } else {
      //return relativePath without file extension
      return relativePath.replace(/\.[^.]*$/, '')
    }
  }, [gltfComponent.src.value])

  const getExportExtension = useCallback(() => {
    if (!gltfComponent.src.value) return 'gltf'
    else return gltfComponent.src.value.endsWith('.gltf') ? 'gltf' : 'glb'
  }, [gltfComponent.src.value])

  const srcPath = useHookstate(getRelativePath())

  const exportType = useHookstate(getExportExtension())

  const onExportModel = () => {
    if (exporting.value) {
      console.warn('already exporting')
      return
    }
    exporting.set(true)
    const fileName = `${srcPath.value}.${exportType.value}`
    exportRelativeGLTF(props.entity, srcProject.value, fileName).then(() => {
      const nuPath = pathJoin(config.client.fileServer, 'projects', srcProject.value, fileName)
      commitProperty(GLTFComponent, 'src')(nuPath)
      exporting.set(false)
    })
  }

  return (
    <NodeEditor
      name={t('editor:properties.model.title')}
      description={t('editor:properties.model.description')}
      Icon={GLTFNodeEditor.iconComponent}
      {...props}
    >
      <InputGroup name="Model Url" label={t('editor:properties.model.lbl-modelurl')}>
        <ModelInput
          value={gltfComponent.src.value}
          onRelease={(src) => {
            commitProperty(GLTFComponent, 'src')(src)
          }}
        />
        {errors?.LOADING_ERROR ||
          (errors?.INVALID_SOURCE && ErrorPopUp({ message: t('editor:properties.model.error-url') }))}
      </InputGroup>

      <InputGroup name="Camera Occlusion" label={t('editor:properties.model.lbl-cameraOcclusion')}>
        <Checkbox
          checked={gltfComponent.cameraOcclusion.value}
          onChange={commitProperty(GLTFComponent, 'cameraOcclusion')}
        />
      </InputGroup>
      <InputGroup name="Apply Colliders" label={t('editor:properties.model.lbl-applyColliders')}>
        <Checkbox
          checked={gltfComponent.applyColliders.value}
          onChange={commitProperty(GLTFComponent, 'applyColliders')}
        />
      </InputGroup>
      {(!hasRigidBody && gltfComponent.applyColliders.value && (
        <>
          <Text className="ml-5 text-red-400">{t('editor:properties.model.lbl-warnRigidBody')}</Text>
          <Button
            title={t('editor:properties.model.lbl-addRigidBody')}
            className="text-sm text-[#FFFFFF]"
            onClick={() => {
              const nodes = SelectionState.getSelectedEntities()
              EditorControlFunctions.addOrRemoveComponent(nodes, RigidBodyComponent, true, { type: 'fixed' })
            }}
          >
            <HiPlus />
            {t('editor:properties.model.lbl-addRigidBody')}
          </Button>
        </>
      )) ||
        ''}
      {(hasRigidBody && (
        <InputGroup name="Shape" label={t('editor:properties.model.lbl-shape')}>
          <SelectInput
            options={shapeTypeOptions}
            value={gltfComponent.shape.value}
            onChange={commitProperty(GLTFComponent, 'shape')}
          />
        </InputGroup>
      )) ||
        ''}
      <Accordion
        className="space-y-4 p-4"
        title={t('editor:properties.model.lbl-export')}
        expandIcon={<IoIosArrowBack className="text-xl text-gray-300" />}
        shrinkIcon={<IoIosArrowDown className="text-xl text-gray-300" />}
        titleClassName="text-gray-300"
        titleFontSize="base"
      >
        {!exporting.value && (
          <>
            <InputGroup name="Export Project" label="Project">
              <SelectInput
                value={srcProject.value}
                options={
                  loadedProjects.value.map((project) => ({
                    label: project,
                    value: project
                  })) ?? []
                }
                onChange={(val) => srcProject.set(val as string)}
              />
            </InputGroup>
            <InputGroup name="File Path" label="File Path">
              <StringInput value={srcPath.value} onChange={srcPath.set} />
            </InputGroup>
            <InputGroup name="Export Type" label={t('editor:properties.model.lbl-exportType')}>
              <SelectInput
                options={[
                  {
                    label: 'glB',
                    value: 'glb'
                  },
                  {
                    label: 'glTF',
                    value: 'gltf'
                  }
                ]}
                value={exportType.value}
                onChange={(val) => exportType.set(val as string)}
              />
            </InputGroup>
            <Button className="self-end" onClick={onExportModel}>
              {t('editor:properties.model.saveChanges')}
            </Button>
          </>
        )}
        {exporting.value && (
          <LoadingView fullSpace className="mb-2 flex h-[20%] w-[20%] justify-center" title=" Exporting..." />
        )}
      </Accordion>
    </NodeEditor>
  )
}
GLTFNodeEditor.iconComponent = MdOutlineViewInAr
export default GLTFNodeEditor
