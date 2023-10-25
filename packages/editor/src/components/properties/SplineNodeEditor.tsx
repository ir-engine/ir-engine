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

import { useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { SplineComponent } from '@etherealengine/engine/src/scene/components/SplineComponent'

import ClearIcon from '@mui/icons-material/Clear'
import TimelineIcon from '@mui/icons-material/Timeline'

import { NO_PROXY } from '@etherealengine/hyperflux'
import { Quaternion, Vector3 } from 'three'
import { PropertiesPanelButton } from '../inputs/Button'
import EulerInput from '../inputs/EulerInput'
import InputGroup from '../inputs/InputGroup'
import Vector3Input from '../inputs/Vector3Input'
import NodeEditor from './NodeEditor'
import { EditorComponentType, commitProperty } from './Util'

/**
 * SplineNodeEditor used to create and customize splines in the scene.
 *
 * @param       {Object} props
 * @constructor
 */

export const SplineNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const component = useComponent(props.entity, SplineComponent)
  const elements = component.elements
  return (
    <NodeEditor description={t('editor:properties.spline.description')} {...props}>
      <InputGroup name="Add Point">
        <PropertiesPanelButton
          onClick={() => {
            const elem = { position: new Vector3(), quaternion: new Quaternion() }
            const newElements = [...elements.get(NO_PROXY), elem]
            commitProperty(SplineComponent, 'elements')(newElements)
          }}
        >
          {t('editor:properties.spline.lbl-addNode')}
        </PropertiesPanelButton>
      </InputGroup>
      {elements.map((elem, index) => (
        <div key={index}>
          <br />
          <div style={{ display: 'flex-row' }}>
            <ClearIcon
              onClick={() => {
                const newElements = [...elements.get(NO_PROXY)].filter((_, i) => i !== index)
                commitProperty(SplineComponent, 'elements')(newElements)
              }}
              style={{ color: 'white' }}
            />
            <InputGroup name="Position" label={`${t('editor:properties.transform.lbl-position')} ${index + 1}`}>
              <Vector3Input
                //style={{ maxWidth: 'calc(100% - 2px)', paddingRight: `3px`, width: '100%' }}
                value={elem.position.value}
                smallStep={0.01}
                mediumStep={0.1}
                largeStep={1}
                onChange={(position) => {
                  commitProperty(
                    SplineComponent,
                    `elements.${index}.position` as any
                  )(new Vector3(position.x, position.y, position.z))
                }}
              />
            </InputGroup>
            <InputGroup name="Rotation" label={`${t('editor:properties.transform.lbl-rotation')} ${index + 1}`}>
              <EulerInput
                //style={{ maxWidth: 'calc(100% - 2px)', paddingRight: `3px`, width: '100%' }}
                quaternion={elem.quaternion.value}
                unit="°"
                onChange={(euler) => {
                  commitProperty(
                    SplineComponent,
                    `elements.${index}.quaternion` as any
                  )(new Quaternion().setFromEuler(euler))
                }}
              />
            </InputGroup>
          </div>
        </div>
      ))}
    </NodeEditor>
  )
}

SplineNodeEditor.iconComponent = TimelineIcon

export default SplineNodeEditor
