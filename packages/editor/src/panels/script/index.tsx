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

import { useQuery } from '@ir-engine/ecs'
import { ScriptComponent } from '@ir-engine/engine'
import { getFileName } from '@ir-engine/engine/src/assets/functions/pathResolver'
import { getMutableState } from '@ir-engine/hyperflux'
import { PanelDragContainer, PanelTitle } from '@ir-engine/ui/src/components/editor/layout/Panel'
import { fetchCode, updateScriptFile } from '@ir-engine/ui/src/components/editor/properties/script'
import { Editor } from '@monaco-editor/react'
import { uniqueId } from 'lodash'
import DockLayout, { DockMode, LayoutData, TabData } from 'rc-dock'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScriptState } from '../../services/ScriptService'

const ActiveScript = ({ scriptURL }) => {
  const [code, setCode] = useState('')

  useEffect(() => {
    fetchCode(scriptURL).then((code) => {
      setCode(code)
    })
  }, [scriptURL])

  useEffect(() => {
    if (!scriptURL) return
    updateScriptFile(getFileName(scriptURL), code)
  }, [code])

  useQuery([ScriptComponent])
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Editor
        height="100%"
        language="javascript"
        defaultLanguage="javascript"
        value={code} // get the file contents
        onChange={(newCode) => {
          setCode(newCode ?? code)
        }}
        theme="vs-dark"
      />
    </div>
  )
}

const createNewScriptTab = (scriptURL) => {
  return {
    id: uniqueId('scriptTab'),
    closable: true,
    cached: true,
    title: <ScriptTabTitle scriptName={getFileName(scriptURL)} />,
    content: <ActiveScript scriptURL={scriptURL} />
  } as TabData
}

const ScriptContainer = () => {
  const scriptState = getMutableState(ScriptState)
  const tabs = scriptState.scripts.keys.map(createNewScriptTab)

  console.log('tabs', tabs) // eslint-disable-line no-console
  const tabLayout = (): LayoutData => {
    return {
      dockbox: {
        mode: 'horizontal' as DockMode,
        children: [{ tabs: tabs }]
      }
    }
  }
  const { t } = useTranslation()

  return (
    <div className="h-full w-full">
      <DockLayout defaultLayout={tabLayout()} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} />
    </div>
  )
}

const ScriptTabTitle = ({ scriptName }) => {
  const { t } = useTranslation()

  return (
    <div>
      <PanelDragContainer dataTestId="script-tab">
        <PanelTitle>{scriptName}</PanelTitle>
      </PanelDragContainer>
    </div>
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
