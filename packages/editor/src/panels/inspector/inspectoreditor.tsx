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

import { toDisplayDateTime } from '@ir-engine/common/src/utils/datetime-sql'
import { getMutableState, useHookstate } from '@ir-engine/hyperflux'
import { Checkbox } from '@ir-engine/ui'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FiEdit2 } from 'react-icons/fi'
import { EditorState } from '../../services/EditorServices'
import { ClickPlacementState } from '../../systems/ClickPlacementSystem'

const InspectorPanel = () => {
  const { metadata } = useHookstate(getMutableState(ClickPlacementState)).value
  return <InspectorEditor data={metadata} />
}

export const InspectorEditor = ({ data }) => {
  const { t } = useTranslation()
  const { thumbnail = '', name = '', type = '', author = '', dateCreated = '', tags = [] } = data
  const leftCellCss = `text-left font-bold`
  const noData = '--'
  const [switchInspector, setSwitchInspector] = useState(false)

  useEffect(() => {
    if (switchInspector) EditorState.setActiveLowerPanel('inspector')
    else EditorState.setActiveLowerPanel('properties')
  }, [switchInspector])

  const toggleSwitchInspector = () => setSwitchInspector(!switchInspector)

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto bg-surface-3 text-text-secondary">
      <div className="text-md flex cursor-pointer flex-row gap-x-3 border-b px-6 py-2" onClick={toggleSwitchInspector}>
        <Checkbox onChange={toggleSwitchInspector} checked={switchInspector} />
        {t('editor:inspector.switchInspector')}
      </div>
      {Object.keys(data).length > 0 ? (
        <div className="flex flex-col gap-6 p-3 px-10">
          <div className="flex h-[202px] items-center justify-center overflow-hidden rounded-md bg-surface-1">
            <img src={thumbnail} alt={name} className="max-h-full max-w-full object-contain" />
          </div>
          <div className="flex flex-row items-center justify-between gap-x-4 break-all">
            <Text fontSize="xl">{name}</Text>
            <div>
              <FiEdit2 />
            </div>
          </div>
          <div className="grid grid-cols-[auto_auto] gap-y-1 text-left">
            <div className={leftCellCss}>{t('editor:inspector.assetType')}</div>
            <div>{type}</div>
            <div className={leftCellCss}>{t('editor:inspector.assetAuthor')}</div>
            <div>{author || noData}</div>
            <div className={leftCellCss}>{t('editor:inspector.assetDateCreated')}</div>
            <div>{toDisplayDateTime(dateCreated) || noData}</div>
            <div className={leftCellCss}>{t('editor:inspector.assetFileSize')}</div>
            <div>{noData}</div>
            <div className={leftCellCss}>{t('editor:inspector.assetDimensions')}</div>
            <div>{noData}</div>
            <div className={leftCellCss}>{t('editor:inspector.assetMeshComplexity')}</div>
            <div>{noData}</div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="font-bold">{t('editor:inspector.assetTags')}</div>
            <div className="text-lg">
              {tags?.length > 0
                ? tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-[#42454D] bg-surface-2 px-3 py-1">
                      {tag}
                    </span>
                  ))
                : ''}
            </div>
          </div>
          <div>
            <button className="rounded-md bg-ui-primary px-5 py-2 text-white">
              {'+'} {t('editor:inspector.addToScene')}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center bg-surface-3 p-3 text-text-secondary">
          {t('editor:inspector.noAssetSelected')}
        </div>
      )}
    </div>
  )
}

export default InspectorPanel
