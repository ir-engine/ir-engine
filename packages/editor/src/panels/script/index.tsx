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

import { stripSearchFromURL } from '@ir-engine/client-core/src/common/services/FileThumbnailJobState'
import { uploadToFeathersService } from '@ir-engine/client-core/src/util/upload'
import { StaticResourceType, uploadScriptPath } from '@ir-engine/common/src/schema.type.module'
import { defineQuery, getComponent, Layers, UndefinedEntity, useQuery } from '@ir-engine/ecs'
import { ScriptComponent } from '@ir-engine/engine'
import { getFileName } from '@ir-engine/engine/src/assets/functions/pathResolver'
import { getMutableState, getState, useHookstate } from '@ir-engine/hyperflux'
import { PanelDragContainer, PanelTitle } from '@ir-engine/ui/src/components/editor/layout/Panel'
import { createNewScriptFile, fetchCode } from '@ir-engine/ui/src/components/editor/properties/script'
import { PlayMd } from '@ir-engine/ui/src/icons'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import Tooltip from '@ir-engine/ui/src/primitives/tailwind/Tooltip'
import { Editor } from '@monaco-editor/react'
import DockLayout, { DockMode, LayoutData, TabData } from 'rc-dock'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaLink, FaLinkSlash } from 'react-icons/fa6'
import { MdClose } from 'react-icons/md'
import { RiSaveLine } from 'react-icons/ri'
import { VscDiscard } from 'react-icons/vsc'
import { twMerge } from 'tailwind-merge'
import { commitProperties } from '../../components/properties/Util'
import { EditorState } from '../../services/EditorServices'
import { ScriptService, ScriptState } from '../../services/ScriptService'
import './ScriptTab.css'

type ScriptUploadResponse = {
  rawScript: StaticResourceType
  processedScript: StaticResourceType
}

export const updateScriptFile = async (fileName: string, script = 'console.log("hello world")') => {
  const file = new File([script], fileName, { type: 'application/x-typescript' })
  const response = await uploadToFeathersService(uploadScriptPath, [file], {
    args: {
      project: getState(EditorState).projectName,
      path: 'public/scripts/'
    }
  }).promise
  return response as ScriptUploadResponse
}

let typesLoaded = false

const loadTypeDefinitions = async () => {
  if (typesLoaded) return

  typesLoaded = true

  const monaco = globalThis.monaco

  // Fetch type definitions from unpkg CDN to work in both development and production
  const reactDTS = await fetch('https://unpkg.com/@types/react/index.d.ts').then((res) => res.text())
  const threeDTS = await fetch('https://unpkg.com/@types/three/index.d.ts').then((res) => res.text())

  // Add type definitions to Monaco
  monaco.languages.typescript.javascriptDefaults.addExtraLib(reactDTS, 'file:///node_modules/@types/react/index.d.ts')
  monaco.languages.typescript.javascriptDefaults.addExtraLib(threeDTS, 'file:///node_modules/@types/three/index.d.ts')

  // Configure language defaults
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    allowNonTsExtensions: true
  })
}

const ActiveScript = ({ scriptURL }: { scriptURL: string }) => {
  const scriptState = useHookstate(getMutableState(ScriptState))
  const editorState = useHookstate(getMutableState(EditorState))
  const { t } = useTranslation()
  const [code, setCode] = useState('')
  const [codeChanged, setCodeChanged] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    fetchCode(scriptURL).then((code) => {
      setCode(code)
    })
  }, [scriptURL])

  const handlePlayClick = () => {
    setShowPreview(true)
  }

  const handleClosePreview = () => {
    setShowPreview(false)
  }

  return (
    <div className="relative flex h-full w-full flex-row items-center justify-center">
      <Editor
        height="100%"
        language="javascript"
        defaultLanguage="javascript"
        value={code} // get the file contents
        onChange={(newCode) => {
          setCode(newCode ?? code)
          setCodeChanged(true)
        }}
        onMount={() => {
          loadTypeDefinitions()
        }}
        theme="vs-dark"
      />
      <div className="flex h-full w-[5%] min-w-10 flex-col items-center justify-end gap-2 py-2">
        <Tooltip content={t('editor:script.panel.play')}>
          <Button variant="primary" className="p-1" data-testid="script-panel-play-button" onClick={handlePlayClick}>
            <PlayMd className="text-green-500 hover:text-amber-300" />
          </Button>
        </Tooltip>
        <Tooltip
          content={
            scriptState.scripts.value[scriptURL] === UndefinedEntity
              ? t('editor:script.panel.unLink')
              : t('editor:script.panel.link')
          }
        >
          <Button
            variant="primary"
            className="p-1"
            data-testid="script-panel-link-button"
            onClick={() => {
              scriptState.scripts.value[scriptURL] === UndefinedEntity
                ? ScriptService.activateScript(scriptURL)
                : ScriptService.deactivateScript(scriptURL)
            }}
          >
            {scriptState.scripts.value[scriptURL] === UndefinedEntity ? (
              <FaLinkSlash className="hover:text-amber-300" />
            ) : (
              <FaLink className="text-green-500 hover:text-red-500" />
            )}
          </Button>
        </Tooltip>
        <Tooltip content={t('editor:script.panel.save')}>
          <Button
            variant="primary"
            className="p-1"
            data-testid="script-panel-save-button"
            onClick={() => {
              updateScriptFile(getFileName(scriptURL), code).then((response) => {
                const entities = scriptQuery().filter((entity) => {
                  const scriptComponent = getComponent(entity, ScriptComponent)
                  return stripSearchFromURL(scriptComponent.src) === scriptURL
                })

                commitProperties(
                  ScriptComponent,
                  {
                    src: response.rawScript.url,
                    bundledSrc: response.processedScript.url
                  },
                  entities
                )
              })
              setCodeChanged(false)
            }}
          >
            <RiSaveLine className={twMerge(codeChanged ? 'text-amber-300' : 'text-white', 'hover:text-green-500')} />
          </Button>
        </Tooltip>
        <Tooltip content={t('editor:script.panel.discard')}>
          <Button
            variant="primary"
            className="p-1"
            data-testid="script-panel-discard-button"
            onClick={() => {
              fetchCode(scriptURL).then((code) => {
                setCode(code)
                setCodeChanged(false)
              })
            }}
          >
            <VscDiscard className="hover:text-amber-300" />
          </Button>
        </Tooltip>
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative h-full w-full">
            <Button variant="primary" className="absolute right-4 top-4 z-50 p-2" onClick={handleClosePreview}>
              <MdClose className="h-6 w-6" />
            </Button>
            <iframe
              className="h-full w-full"
              src={`/offline?project=${editorState.projectName.value}&scenePath=${editorState.scenePath.value!.replace(
                'projects/' + editorState.projectName.value + '/',
                ''
              )}`}
              style={{ border: 0 }}
              allow="microphone; camera; autoplay; clipboard-write; encrypted-media"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  )
}

const createNewScriptTab = (scriptURL: string) => {
  return {
    id: scriptURL,
    closable: true,
    cached: true,
    title: <ScriptTabTitle scriptName={getFileName(scriptURL)} />,
    content: <ActiveScript scriptURL={scriptURL} />
  } as TabData
}

const scriptQuery = defineQuery([ScriptComponent], Layers.Authoring)

const ScriptContainer = () => {
  const scriptState = useHookstate(getMutableState(ScriptState))

  const scriptQuery = useQuery([ScriptComponent], Layers.Authoring)

  useEffect(() => {
    scriptQuery.forEach((entity) => {
      const scriptComponent = getComponent(entity, ScriptComponent)
      if (!scriptComponent.src) return
      if (!scriptState.scripts.value[scriptComponent.src]) {
        ScriptService.addScript(scriptComponent.src)
      }
    })
  }, [scriptQuery])

  const dockPanelRef = useRef<DockLayout>(null)

  const tabLayout = (): LayoutData => {
    return {
      dockbox: {
        mode: 'horizontal' as DockMode,
        children: [{ tabs: scriptState.scripts.keys.map(createNewScriptTab) }]
      }
    }
  }

  useEffect(() => {
    dockPanelRef.current?.loadLayout(tabLayout())
  }, [scriptState.scripts])

  const { t } = useTranslation()

  return (
    <div id="script-container" className="flex h-full w-full items-center justify-center">
      {scriptState.scripts.keys.length !== 0 ? (
        <DockLayout
          onLayoutChange={(_newLayout, currentTabId, direction) => {
            if (direction === 'remove') ScriptService.removeScript(currentTabId)
          }}
          ref={dockPanelRef}
          defaultLayout={tabLayout()}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0
          }}
        />
      ) : (
        <Button
          variant="tertiary"
          onClick={async () => {
            const scriptURL = await createNewScriptFile()
            ScriptService.addScript(scriptURL)
          }}
        >
          {t('editor:script.panel.addScript')}
        </Button>
      )}
    </div>
  )
}

const ScriptTabTitle = ({ scriptName }: { scriptName: string }) => {
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
