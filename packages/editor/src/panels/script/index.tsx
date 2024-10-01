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

import { useHookstate } from '@hookstate/core'
import { hasComponent, useOptionalComponent, useQuery } from '@ir-engine/ecs'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import { SelectionState } from '@ir-engine/editor/src/services/SelectionServices'
import { ScriptComponent, validateScriptUrl } from '@ir-engine/engine'
import { getFileName } from '@ir-engine/engine/src/assets/functions/pathResolver'
import { clearErrors } from '@ir-engine/engine/src/scene/functions/ErrorFunctions'
import { PanelDragContainer, PanelTitle } from '@ir-engine/ui/src/components/editor/layout/Panel'
import { fetchCode, updateScriptFile } from '@ir-engine/ui/src/components/editor/properties/script'
import { Editor } from '@monaco-editor/react'
import { TabData } from 'rc-dock'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../components/inputs/Button'

const ActiveScript = () => {
  const entities = SelectionState.useSelectedEntities()
  const entity = entities[entities.length - 1]
  const validEntity = typeof entity === 'number' && hasComponent(entity, ScriptComponent)
  const { t } = useTranslation()
  const scriptComponent = useOptionalComponent(entity, ScriptComponent)
  const fileCode = useHookstate('')

  useEffect(() => {
    if (!scriptComponent?.src.value) return
    if (!validateScriptUrl(entity, scriptComponent?.src.value)) return
    clearErrors(entity, ScriptComponent)

    fetchCode(scriptComponent!.src.value).then((code) => {
      fileCode.set(code)
    })
  }, [scriptComponent?.src])

  const addScript = () => EditorControlFunctions.addOrRemoveComponent([entity], ScriptComponent, true)
  useQuery([ScriptComponent])
  return (
    <div className="flex h-full w-full items-center justify-center">
      {entities.length && !validEntity ? (
        <Button
          variant="outline"
          onClick={() => {
            addScript()
          }}
        >
          {t('editor:script.panel.addScript')}
        </Button>
      ) : (
        <></>
      )}
      {validEntity && (
        <Editor
          height="100%"
          language="typescript"
          defaultLanguage="typescript"
          value={fileCode.value} // get the file contents
          onChange={(newCode) => {
            if (newCode === fileCode.value) return
            if (!scriptComponent?.src.value) return
            if (!validateScriptUrl(entity, scriptComponent?.src.value)) return
            clearErrors(entity, ScriptComponent)
            updateScriptFile(getFileName(scriptComponent!.src.value), newCode)
          }}
          theme="vs-dark"
        />
      )}
    </div>
  )
}

const ScriptContainer = () => {
  return (
    <>
      <div className="flex h-full w-full flex-col">
        <ActiveScript />
      </div>
    </>
  )
}

export const ScriptPanelTitle = () => {
  const { t } = useTranslation()

  return (
    <div>
      <PanelDragContainer>
        <PanelTitle>{t('editor:script.panel.title')}</PanelTitle>
      </PanelDragContainer>
    </div>
  )
}

export const ScriptPanelTab: TabData = {
  id: 'scriptPanel',
  closable: true,
  title: <ScriptPanelTitle />,
  content: <ScriptContainer />
}
