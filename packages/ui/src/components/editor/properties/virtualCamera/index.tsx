import { useComponent } from '@etherealengine/ecs'
import {
  EditorComponentType,
  commitProperty,
  updateProperty
} from '@etherealengine/editor/src/components/properties/Util'
import { VirtualCameraComponent } from '@etherealengine/spatial/src/camera/components/VirtualCameraComponent'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { HiCamera } from 'react-icons/hi'
import InputGroup from '../../input/Group'
import NumericInput from '../../input/Numeric'
import NodeEditor from '../nodeEditor'

export const VirtualCameraNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const virtualCameraComponent = useComponent(props.entity, VirtualCameraComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.virtualcamera.name')}
      description={t('editor:properties.virtualcamera.description')}
      icon={<VirtualCameraNodeEditor.iconComponent />}
    >
      <InputGroup name="FOV" label={t('editor:properties.virtualcamera.lbl-fov')}>
        <NumericInput
          min={0}
          smallStep={0.001}
          mediumStep={0.01}
          largeStep={0.1}
          value={virtualCameraComponent.fov.value}
          onChange={updateProperty(VirtualCameraComponent, 'fov')}
          onRelease={commitProperty(VirtualCameraComponent, 'fov')}
        />
      </InputGroup>
      <InputGroup name="Near" label={t('editor:properties.virtualcamera.lbl-near')}>
        <NumericInput
          min={0}
          smallStep={0.001}
          mediumStep={0.01}
          largeStep={0.1}
          value={virtualCameraComponent.near.value}
          onChange={updateProperty(VirtualCameraComponent, 'near')}
          onRelease={commitProperty(VirtualCameraComponent, 'near')}
        />
      </InputGroup>
      <InputGroup name="Far" label={t('editor:properties.virtualcamera.lbl-far')}>
        <NumericInput
          min={0}
          smallStep={0.001}
          mediumStep={0.01}
          largeStep={0.1}
          value={virtualCameraComponent.far.value}
          onChange={updateProperty(VirtualCameraComponent, 'far')}
          onRelease={commitProperty(VirtualCameraComponent, 'far')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

VirtualCameraNodeEditor.iconComponent = HiCamera

export default VirtualCameraNodeEditor
