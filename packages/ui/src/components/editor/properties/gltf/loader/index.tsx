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

import { useComponent } from '@ir-engine/ecs'
import { commitProperty, EditorComponentType } from '@ir-engine/editor/src/components/properties/Util'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { t } from 'i18next'
import React from 'react'
import { MdOutlineViewInAr } from 'react-icons/md'
import InputGroup from '../../../input/Group'
import ModelInput from '../../../input/Model'
import NodeEditor from '../../nodeEditor'

const GLTFNodeEditor: EditorComponentType = (props) => {
  const gltfComponent = useComponent(props.entity, GLTFComponent)

  // const errors = getEntityErrors(props.entity, GLTFComponent)

  return (
    <NodeEditor
      name={t('editor:properties.model.title')}
      description={t('editor:properties.model.description')}
      icon={<GLTFNodeEditor.iconComponent />}
      {...props}
    >
      <InputGroup name="Model Url" label={t('editor:properties.model.lbl-modelurl')}>
        <ModelInput
          value={gltfComponent.src.value}
          onRelease={(src) => {
            commitProperty(GLTFComponent, 'src')(src)
          }}
        />
        {/* {errors?.LOADING_ERROR ||
          (errors?.INVALID_SOURCE && ErrorPopUp({ message: t('editor:properties.model.error-url') }))} */}
      </InputGroup>
    </NodeEditor>
  )
}
GLTFNodeEditor.iconComponent = MdOutlineViewInAr
export default GLTFNodeEditor
