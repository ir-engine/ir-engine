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
