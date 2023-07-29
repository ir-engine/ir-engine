/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React from 'react'
import { useTranslation } from 'react-i18next'

import { getComponent, useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { GroupComponent } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { SplineComponent } from '@etherealengine/engine/src/scene/components/SplineComponent'

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
  const spline = useComponent(props.entity, SplineComponent).spline.value

  const onAddNode = () => {
    const obj3d = getComponent(props.entity, GroupComponent)[0]
    //const newSplineObject = obj3d.userData.helper.addPoint()
    const newSplineObject = spline.addPoint()
    obj3d.add(newSplineObject)
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
        <PropertiesPanelButton onClick={onAddNode}>{t('editor:properties.spline.lbl-addNode')}</PropertiesPanelButton>
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
            //style={{ maxWidth: 'calc(100% - 2px)', paddingRight: `3px`, width: '100%' }}
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
