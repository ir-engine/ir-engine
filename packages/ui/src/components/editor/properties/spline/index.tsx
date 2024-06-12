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

import { SplineComponent } from '@etherealengine/engine/src/scene/components/SplineComponent'

import { MdOutlineTimeline } from 'react-icons/md'

import { useComponent } from '@etherealengine/ecs'
import { EditorComponentType, commitProperty } from '@etherealengine/editor/src/components/properties/Util'
import { NO_PROXY } from '@etherealengine/hyperflux'
import { BsPlusSquare } from 'react-icons/bs'
import { MdClear } from 'react-icons/md'
import { Quaternion, Vector3 } from 'three'
import EulerInput from '../../input/Euler'
import InputGroup from '../../input/Group'
import Vector3Input from '../../input/Vector3'
import NodeEditor from '../nodeEditor'

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
    <NodeEditor
      description={t('editor:properties.spline.description')}
      icon={<SplineNodeEditor.iconComponent />}
      {...props}
    >
      <div className="flex-strech flex w-full flex-row items-center gap-2 py-1">
        <div className="flex w-full justify-center font-['Figtree'] text-xs font-normal text-neutral-50">
          {t('editor:properties.spline.lbl-addNode')}
        </div>
        <div className="flex w-full justify-end px-8">
          <BsPlusSquare
            onClick={() => {
              const elem = { position: new Vector3(), quaternion: new Quaternion() }
              const newElements = [...elements.get(NO_PROXY), elem]
              commitProperty(SplineComponent, 'elements')(newElements)
            }}
          ></BsPlusSquare>
        </div>
      </div>
      {elements.map(
        (
          elem,
          index // need styling
        ) => (
          <div key={index}>
            <div className="flex-end border-t-2 border-zinc-900 py-2">
              <div className="flex w-full flex-row px-10">
                <div className="flex w-full justify-start font-['Figtree'] text-xs font-normal text-neutral-50">
                  {`Node ${index + 1}`}
                </div>
                <div className="flex w-full justify-end">
                  <MdClear
                    className="text-neutral-700"
                    onClick={() => {
                      const newElements = [...elements.get(NO_PROXY)].filter((_, i) => i !== index)
                      commitProperty(SplineComponent, 'elements')(newElements)
                    }}
                  />
                </div>
              </div>
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
        )
      )}
    </NodeEditor>
  )
}

SplineNodeEditor.iconComponent = MdOutlineTimeline

export default SplineNodeEditor
