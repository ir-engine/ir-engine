import React from 'react'
import { useTranslation } from 'react-i18next'

import { getComponentState, useComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { SplineComponent } from '@xrengine/engine/src/scene/components/SplineComponent'

import ClearIcon from '@mui/icons-material/Clear'
import TimelineIcon from '@mui/icons-material/Timeline'

import { PropertiesPanelButton } from '../inputs/Button'
import InputGroup from '../inputs/InputGroup'
import Vector3Input from '../inputs/Vector3Input'
import NodeEditor from './NodeEditor'
import { EditorComponentType } from './Util'

/**
 * SplineNodeEditor used to create and customize splines in the scene.
 *
 * @param       {Object} props
 * @constructor
 */

export const SplineNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const spline = useComponent(props.node.entity, SplineComponent).spline.value

  const onAddPoint = () => {
    spline.addPoint()
    getComponentState(props.node.entity, SplineComponent).spline._splinePointsLength.set((val) => val)
  }

  const onRemovePoint = (point) => {
    spline.removePoint(point)
  }

  const onRelease = () => {
    spline.updateSplineOutline()
  }

  const helperObjects = spline.getCurrentSplineHelperObjects()

  return (
    <NodeEditor description={t('editor:properties.spline.description')} {...props}>
      <InputGroup name="Add Point">
        <PropertiesPanelButton onClick={onAddPoint}>{t('editor:properties.spline.lbl-addNode')}</PropertiesPanelButton>
      </InputGroup>
      {helperObjects.map((point, i) => (
        <InputGroup
          key={point.uuid}
          name="Position"
          label={`${t('editor:properties.transform.lbl-position')} ${i + 1}`}
        >
          <div style={{}} onClick={() => onRemovePoint(point)}>
            <ClearIcon style={{ color: 'white' }} />
          </div>
          <Vector3Input
            style={{ maxWidth: 'calc(100% - 2px)', paddingRight: `3px`, width: '100%' }}
            value={point.position}
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={1}
            onChange={(val) => {
              point.position.copy(val)
              spline.updateSplineOutline()
            }}
            onRelease={onRelease}
          />
        </InputGroup>
      ))}
    </NodeEditor>
  )
}

SplineNodeEditor.iconComponent = TimelineIcon

export default SplineNodeEditor
