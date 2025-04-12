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

import { PopoverState } from '@ir-engine/client-core/src/common/services/PopoverState'
import { createScene } from '@ir-engine/client-core/src/world/SceneAPI'
import { UIAddonsState } from '@ir-engine/editor/src/services/UIAddonsState'
import { NO_PROXY, getMutableState, useMutableState } from '@ir-engine/hyperflux'
import { Button } from '@ir-engine/ui'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FiCodepen, FiTool } from 'react-icons/fi'
import Scene1 from '/static/editor/scene-1.png'
import Scene2 from '/static/editor/scene-2.png'

const handleOpenSceneInStudio = async (projectName: string, sceneKey: string) => {
  const studioUrl = `${window.location.origin}/studio?project=${projectName}&scenePath=${sceneKey}`
  window.open(studioUrl, '_self')?.focus()
}

export interface SceneOptionData {
  title: string
  description: string
  icon?: React.ElementType
  onOptionSelectedAnalytics?: (selectedSceneOption: SceneOptionData) => void
  onSubmit?: () => void
  submitButtonText?: string
}

export const SceneOptionButton = ({
  sceneOptionData,
  selectedSceneOption = null,
  onSelect
}: {
  sceneOptionData: SceneOptionData
  selectedSceneOption?: SceneOptionData | null
  onSelect?: (sceneOption: SceneOptionData) => void
}) => {
  const Icon = sceneOptionData.icon || FiCodepen

  const areSceneOptionDataEqual = (option1: SceneOptionData | null, option2: SceneOptionData | null) => {
    return (
      option1 &&
      option2 &&
      option1.title == option2.title &&
      option1.description == option2.description &&
      option1.icon == option2.icon
    )
  }

  return (
    <button
      className={`flex h-[125px] w-[415px] flex-row gap-3 rounded-lg border bg-ui-background p-3 ${
        areSceneOptionDataEqual(selectedSceneOption, sceneOptionData)
          ? 'border-ui-primary bg-ui-quadrary'
          : 'border-ui-outline'
      }`}
      style={{ boxShadow: '0px 2px 4px -2px rgba(0, 0, 0, 0.10), 0px 4px 6px -1px rgba(0, 0, 0, 0.10)' }}
      onClick={() => {
        onSelect?.(sceneOptionData)
      }}
    >
      <Icon className="-mt-[2px] aspect-square flex-shrink-0 text-[30px] text-text-primary" />
      <div className="flex flex-col items-start gap-[6px] text-left">
        <div className="text-xl font-semibold leading-[1.3rem] text-text-primary">{sceneOptionData.title}</div>
        <p className="text-sm leading-[1.4rem] text-text-secondary">{sceneOptionData.description}</p>
      </div>
    </button>
  )
}

type CarouselProps = {
  images: string[]
  className?: string
}

const ImageCarousel = ({ images, className }: CarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const TRANSITION_DURATION = 400 // ms
  const DISPLAY_DURATION = 1400 // ms

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, DISPLAY_DURATION + TRANSITION_DURATION)

    return () => clearInterval(timer)
  }, [images.length])

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      {images.map((image, index) => (
        <img
          key={index}
          src={image}
          className={`absolute h-full w-full object-cover transition-opacity duration-[${TRANSITION_DURATION}] ease-linear
            ${currentIndex === index ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}
    </div>
  )
}

type AddNewSceneProps = {
  projectName: string
}

export const AddScene = ({ projectName }: AddNewSceneProps) => {
  if (!projectName) {
    return null
  }

  const { t } = useTranslation()

  const [selectedSceneOption, setSelectedSceneOption] = useState(null as SceneOptionData | null)

  const element = useMutableState(UIAddonsState).editor.newScene.get(NO_PROXY)
  const cancelText = useMutableState(UIAddonsState).editor.cancelText.get(NO_PROXY)
  getMutableState(UIAddonsState).projectName.set(projectName)

  useLayoutEffect(() => {
    setSelectedSceneOption(null)
  }, [])

  const handleCreateDefaultScene = async () => {
    const scene = await createScene(projectName)
    handleOpenSceneInStudio(projectName, scene.key)
  }

  const onContinueClicked = async () => {
    Object.values(element).map((value, _index) => {
      if (value.onOptionSelectedAnalytics && selectedSceneOption) {
        value.onOptionSelectedAnalytics(selectedSceneOption)
      }
    })
    selectedSceneOption?.onSubmit?.()
  }

  const defaultSceneOptionData: SceneOptionData = {
    title: t('editor:dialog.addScene.optionButtons.defaultEditor.title'),
    description: t('editor:dialog.addScene.optionButtons.defaultEditor.description'),
    icon: FiTool,
    onSubmit: handleCreateDefaultScene,
    submitButtonText: t('editor:dialog.addScene.optionButtons.defaultEditor.submitButtonText')
  }

  return (
    <div className="absolute z-50 w-fit max-w-5xl rounded-xl border-2 border-surface-outline-1-1 bg-surface-2">
      <div className="flex flex-col items-center px-6">
        <h1
          className="w-full border-b border-surface-outline-4-1 py-5 text-center text-2xl font-semibold leading-[1.3rem] text-text-primary"
          data-testid="modal-title-text"
        >
          {t('editor:dialog.addScene.title')}
        </h1>

        <div className="my-3 flex max-h-[60vh] w-full flex-col gap-4 overflow-y-auto rounded-[10px] border border-surface-outline-3-1 bg-surface-3 px-8 py-6 lg:flex-row">
          <div className="flex flex-col gap-4">
            {/* maps out other SceneOptionButtons that have been added on */}
            {Object.values(element).map((value, index) => {
              return (
                <SceneOptionButton
                  key={index}
                  sceneOptionData={value}
                  selectedSceneOption={selectedSceneOption}
                  onSelect={setSelectedSceneOption}
                />
              )
            })}
            <SceneOptionButton
              key={'default'}
              sceneOptionData={defaultSceneOptionData}
              selectedSceneOption={selectedSceneOption}
              onSelect={setSelectedSceneOption}
            />
          </div>

          <div className="hidden h-[266px] w-[440px] max-w-[440px] rounded-[4px] lg:flex">
            <ImageCarousel images={[Scene1, Scene2]} className="h-full w-full rounded-[4px]" />
          </div>
        </div>

        <div className="grid w-full grid-cols-[228px,1fr,228px] border-t-[0.5px] border-surface-outline-4-1 py-6">
          <Button size="sm" variant="secondary" className="w-[228px]" onClick={() => PopoverState.hidePopupover()}>
            {t(cancelText ?? 'editor:dialog.addScene.cancel')}
          </Button>
          {!!selectedSceneOption && (
            <Button
              size="sm"
              variant="primary"
              className="col-start-3 w-[228px]"
              onClick={onContinueClicked}
              hidden={selectedSceneOption === null}
            >
              {t(selectedSceneOption?.submitButtonText ?? 'editor:dialog.addScene.continue')}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
