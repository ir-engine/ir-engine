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

import { EditorComponentType } from '@etherealengine/editor/src/components/properties/Util'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { BsPlusSquare } from 'react-icons/bs'
import { LuImage } from 'react-icons/lu'
import { Quaternion, Vector3 } from 'three'
import Text from '../../../../primitives/tailwind/Text'
import InputGroup from '../../input/Group'
import StringInput from '../../input/String'
import NodeEditor from '../nodeEditor'

export const GalleryNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  //const spawnComponent = useComponent(props.entity, SpawnPointComponent)
  const elements = ['hello', 'bye', 'thanks'] // temp use

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.gallery.name')}
      description={t('editor:properties.gallery.description')}
      icon={<GalleryNodeEditor.iconComponent />}
    >
      <div className="flex w-full items-center gap-2 py-1">
        <Text fontSize="xs" className="ml-14 w-full">
          {t('editor:properties.gallery.lbl-thumbnail')}
        </Text>
        <div className="flex w-full justify-end px-8">
          <BsPlusSquare
            className="text-white"
            onClick={() => {
              const elem = { position: new Vector3(), quaternion: new Quaternion() }
              const newElements = [
                //...elements.get(NO_PROXY),
                ...elements,
                elem
              ]
              //commitProperty(, 'elements')(newElements)
            }}
          />
        </div>
      </div>
      {elements.map(
        (
          elem,
          index // need styling
        ) => (
          <div key={elem + index} className="flex-end relative border-t-2 border-zinc-900 py-2">
            <Text className="absolute left-6 text-[#FAFAFA]" fontSize="sm">
              {t('editor:properties.gallery.lbl-asset') + ' ' + (index + 1)}
            </Text>
            <InputGroup label={`${t('editor:properties.gallery.lbl-thumbnail')} ${index + 1}`}>
              <StringInput
                value={''}
                onChange={(value) => {
                  //updateProperty(, '')
                }}
                onRelease={(value) => {
                  //commitProperty(, '')
                }}
              />
            </InputGroup>
            <InputGroup label={`${t('editor:properties.gallery.lbl-performerURL')} ${index + 1}`}>
              <StringInput
                value={''}
                onChange={(value) => {
                  //updateProperty(, '')
                }}
                onRelease={(value) => {
                  //commitProperty(, '')
                }}
              />
            </InputGroup>
          </div>
        )
      )}
    </NodeEditor>
  )
}

GalleryNodeEditor.iconComponent = LuImage

export default GalleryNodeEditor
