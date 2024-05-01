import { SceneElementType } from '@etherealengine/editor/src/components/element/ElementList'
import { ItemTypes } from '@etherealengine/editor/src/constants/AssetTypes'
import { EditorControlFunctions } from '@etherealengine/editor/src/functions/EditorControlFunctions'
import { getCursorSpawnPosition } from '@etherealengine/editor/src/functions/screenSpaceFunctions'
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
    />
  )
}

const ViewPortPanelContainer = () => {
  const { t } = useTranslation()
  //const sceneName = useHookstate(getMutableState(EditorState).sceneName).value
  const sceneName = 'test'
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex h-8 flex-row items-center bg-zinc-900">
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
        <div className="flex h-full w-full flex-col justify-center">
          <img className="mt-[-50px] opacity-80" src="/static/etherealengine.png" alt="" />
          <h2 className="text-white-400 mt-[30px] w-full text-center font-[normal] text-[100%]">
            {t('editor:selectSceneMsg')}
          </h2>
        </div>
      )}
    </div>
  )
}

export default ViewPortPanelContainer
