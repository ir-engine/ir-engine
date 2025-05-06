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

import { getMutableState, useHookstate } from '@ir-engine/hyperflux'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ClickPlacementState } from '../../systems/ClickPlacementSystem'

const InspectorEditor = () => {
  const { t } = useTranslation()
  const { metadata } = useHookstate(getMutableState(ClickPlacementState)).value
  const { thumbnail, name, type, author, dateCreated, fileSize, dimensions, mesh, resources, tags } = metadata

  return Object.keys(metadata).length > 0 ? (
    <div className="flex h-full flex-col p-3 px-10 text-text-secondary">
      <div className="align-center flex justify-center">
        <img src={thumbnail} alt={name} className="m-3 text-center" />
      </div>
      <Text fontSize="xl">{name}</Text>
      <div></div>
    </div>
  ) : (
    <div className="flex h-full items-center justify-center p-3 text-text-secondary">No asset selected</div>
  )
}

export default InspectorEditor
