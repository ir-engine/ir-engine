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

import { SceneElementType } from '@etherealengine/editor/src/components/element/ElementList'
import { ItemTypes } from '@etherealengine/editor/src/constants/AssetTypes'
import { EditorControlFunctions } from '@etherealengine/editor/src/functions/EditorControlFunctions'
import { getCursorSpawnPosition } from '@etherealengine/editor/src/functions/screenSpaceFunctions'
import { EditorState } from '@etherealengine/editor/src/services/EditorServices'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { TransformComponent } from '@etherealengine/spatial'
import React from 'react'
import { useDrop } from 'react-dnd'
import { useTranslation } from 'react-i18next'
import { CiPlay1 } from 'react-icons/ci'
import { DiSnapSvg } from 'react-icons/di'
import { GoGlobe } from 'react-icons/go'
import { LuAtom, LuCircleDot } from 'react-icons/lu'
import { MdGrid4X4 } from 'react-icons/md'
import { PiArrowCircleUpRight } from 'react-icons/pi'
import { RiRulerLine } from 'react-icons/ri'
import { twMerge } from 'tailwind-merge'
import { Vector2, Vector3 } from 'three'
import NumericInput from '../../../input/Numeric'
import SelectInput from '../../../input/Select'

console.log('Intializing viewport')

const ViewportDnD = () => {
  const [{ isDragging, isOver }, dropRef] = useDrop({
    accept: [ItemTypes.Component],
    collect: (monitor) => ({
      isDragging: monitor.getItem() !== null && monitor.canDrop(),
      isOver: monitor.isOver()
    }),
    drop(item: SceneElementType, monitor) {
      const vec3 = new Vector3()
      getCursorSpawnPosition(monitor.getClientOffset() as Vector2, vec3)
      EditorControlFunctions.createObjectFromSceneElement([
        { name: item!.componentJsonID },
        { name: TransformComponent.jsonID, props: { position: vec3 } }
      ])
    }
  })

  return (
    <div
      id="viewport-panel"
      ref={dropRef}
      className={twMerge(
        'h-full w-full',
        isDragging && isOver ? 'border-[5px]' : 'border-none',
        isDragging ? 'pointer-events-auto' : 'pointer-events-none'
      )}
    >
      <canvas
        id="viewport-renderer-canvas"
        tabIndex={1}
        className="pointer-events-auto absolute inset-0 z-0 h-full w-full select-none"
      ></canvas>
    </div>
  )
}

const ViewPortPanelContainer = () => {
  const { t } = useTranslation()
  const sceneName = useHookstate(getMutableState(EditorState).sceneName).value
  return (
    <div className="flex h-full w-full flex-col">
      <div className="z-10 flex h-8 flex-row items-center bg-zinc-900">
        <div className="inline-flex h-[26px] w-24 items-center justify-start gap-2 overflow-hidden rounded-sm bg-neutral-900 py-1 pl-2 pr-1">
          <GoGlobe className="text-white" size={70} />
          <SelectInput /> {/* modify with custom styling later */}
        </div>
        <div className="inline-flex h-[26px] w-24 items-center justify-start gap-2 overflow-hidden rounded-sm bg-neutral-900 py-1 pl-2 pr-1">
          <LuCircleDot className="text-white" size={70} />
          <SelectInput /> {/* modify with custom styling later */}
        </div>
        <div className="inline-flex h-[26px] w-20 items-center justify-start gap-2 overflow-hidden rounded-sm bg-neutral-900 py-1 pl-2 pr-1">
          <MdGrid4X4 className="text-white" size={250} />
          <NumericInput
            onChange={function (n: number): void {
              throw new Error('Function not implemented.')
            }}
          />{' '}
          {/* modify with custom styling later */}
        </div>
        <div className="inline-flex h-[26px] w-[120px] items-center justify-start gap-2 overflow-hidden rounded-sm bg-neutral-900 py-1 pl-2 pr-1">
          <DiSnapSvg className="text-white" size={3000} />
          <NumericInput
            onChange={function (n: number): void {
              throw new Error('Function not implemented.')
            }}
          />{' '}
          {/* modify with custom styling later */}
          <NumericInput
            onChange={function (n: number): void {
              throw new Error('Function not implemented.')
            }}
          />{' '}
          {/* modify with custom styling later */}
        </div>
        <div className="flex h-[26px] w-[26px] items-center overflow-hidden rounded bg-neutral-900 p-1.5">
          <PiArrowCircleUpRight className="text-white" size={70} />
        </div>
        <div className="flex h-[26px] w-[26px] items-center overflow-hidden rounded bg-neutral-900 p-1.5">
          <RiRulerLine className="text-white" size={70} />
        </div>
        <div className="flex h-[26px] w-[26px] items-center overflow-hidden rounded bg-neutral-900 p-1.5">
          <LuAtom className="text-white" size={70} />
        </div>
        <div className="ml-auto flex h-8 w-11 items-center bg-neutral-900 px-4 py-2">
          <CiPlay1 className="text-white" size={70} />
        </div>
      </div>
      {sceneName ? (
        <ViewportDnD />
      ) : (
        <div className="z-0 flex h-full w-full flex-col justify-center">
          <img className="mt-[-50px] object-contain opacity-80" src="/static/etherealengine.png" alt="" />
          <h2 className="text-white-400 mt-[30px] w-full text-center font-[normal] text-[100%]">
            {t('editor:selectSceneMsg')}
          </h2>
        </div>
      )}
    </div>
  )
}

export default ViewPortPanelContainer
