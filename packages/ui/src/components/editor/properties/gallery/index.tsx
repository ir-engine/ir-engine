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
import StreetviewIcon from '@mui/icons-material/Streetview'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { BsPlusSquare } from 'react-icons/bs'
import { MdClear } from 'react-icons/md'
import { Quaternion, Vector3 } from 'three'
import InputGroup from '../../input/Group'
import StringInput from '../../input/String'
import NodeEditor from '../nodeEditor'

/**
 * SpawnPointNodeEditor component used to provide the editor view to customize Spawn Point properties.
 *
 * @type {Class component}
 */
export const GalleryNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  //const spawnComponent = useComponent(props.entity, SpawnPointComponent)
  const elements = ['hello', 'bye', 'thanks'] // temp use

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.spawnPoint.name')}
      description={t('editor:properties.spawnPoint.description')}
    >
      <div className="flex-strech flex w-full flex-row items-center gap-2 py-1">
        <div className="flex w-full justify-center font-['Figtree'] text-xs font-normal text-neutral-50">
          {'Assets'}
        </div>
        <div className="flex w-full justify-end px-8">
          <BsPlusSquare
            onClick={() => {
              const elem = { position: new Vector3(), quaternion: new Quaternion() }
              const newElements = [
                //...elements.get(NO_PROXY),
                ...elements,
                elem
              ]
              //commitProperty(, 'elements')(newElements)
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
                  {`Asset ${index + 1}`}
                </div>
                <div className="flex w-full justify-end">
                  <MdClear
                    className="text-neutral-700"
                    onClick={() => {
                      const newElements = [...elements].filter((_, i) => i !== index)
                      //commitProperty(, 'elements')(newElements)
                    }}
                  />
                </div>
              </div>
              <InputGroup
                name={`Thumbnail ${index + 1}`}
                label={`${t('editor:properties.gallery.lbl-thumbnail')} ${index + 1}`}
              >
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
              <InputGroup
                name={`Performer URL ${index + 1}`}
                label={`${t('editor:properties.gallery.lbl-performerURL')} ${index + 1}`}
              >
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
          </div>
        )
      )}
    </NodeEditor>
  )
}

GalleryNodeEditor.iconComponent = StreetviewIcon

export default GalleryNodeEditor
