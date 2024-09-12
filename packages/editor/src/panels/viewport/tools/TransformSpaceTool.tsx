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

import { setTransformSpace, toggleTransformSpace } from '@ir-engine/editor/src/functions/transformFunctions'
import { EditorHelperState } from '@ir-engine/editor/src/services/EditorHelperState'
import { TransformSpace } from '@ir-engine/engine/src/scene/constants/transformConstants'
import { getMutableState, useHookstate } from '@ir-engine/hyperflux'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import Select from '@ir-engine/ui/src/primitives/tailwind/Select'
import Tooltip from '@ir-engine/ui/src/primitives/tailwind/Tooltip'
import { t } from 'i18next'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { PiGlobeSimple } from 'react-icons/pi'

const transformSpaceOptions = [
  {
    label: t('editor:toolbar.transformSpace.lbl-selection'),
    description: t('editor:toolbar.transformSpace.info-selection'),
    value: TransformSpace.local
  },
  {
    label: t('editor:toolbar.transformSpace.lbl-world'),
    description: t('editor:toolbar.transformSpace.info-world'),
    value: TransformSpace.world
  }
]

const TransformSpaceTool = () => {
  const { t } = useTranslation()

  const transformSpace = useHookstate(getMutableState(EditorHelperState).transformSpace)

  return (
    <div className="flex items-center">
      <Tooltip content={t('editor:toolbar.transformSpace.lbl-toggleTransformSpace')}>
        <Button
          startIcon={<PiGlobeSimple className="text-theme-input" />}
          onClick={toggleTransformSpace}
          variant="transparent"
          className="px-0"
        />
      </Tooltip>
      <Tooltip
        title={
          transformSpace.value === TransformSpace.local
            ? t('editor:toolbar.transformSpace.info-selection')
            : t('editor:toolbar.transformSpace.info-world')
        }
        content={t('editor:toolbar.transformSpace.description')}
        position="right center"
      >
        <Select
          key={transformSpace.value}
          inputClassName="py-1 h-6 rounded-sm text-theme-gray3 text-xs"
          className="m-1 w-24 border-theme-input text-theme-gray3"
          onChange={setTransformSpace}
          options={transformSpaceOptions}
          currentValue={transformSpace.value}
        />
      </Tooltip>
    </div>
  )
}

export default TransformSpaceTool
