import { EditorControlFunctions } from '@etherealengine/editor/src/functions/EditorControlFunctions'
import { setTransformMode } from '@etherealengine/editor/src/functions/transformFunctions'
import { EditorHelperState } from '@etherealengine/editor/src/services/EditorHelperState'
import { TransformMode } from '@etherealengine/engine/src/scene/constants/transformConstants'
import { useMutableState } from '@etherealengine/hyperflux'
import React from 'react'
import { TbPointer, TbRefresh, TbVector, TbWindowMaximize } from 'react-icons/tb'
import { twMerge } from 'tailwind-merge'
import Button from '../../../../../primitives/tailwind/Button'

function Placer() {
  return (
    <>
      <div className="mt-2 h-1 w-6 bg-[#2B2C30]" />
      <div className="mt-1 h-1 w-6 bg-[#2B2C30]" />
    </>
  )
}

export default function GizmoTool() {
  const editorHelperState = useMutableState(EditorHelperState)
  const transformMode = editorHelperState.transformMode.value

  return (
    <div className="absolute left-4 top-14 z-10 flex flex-col items-center rounded-lg bg-black p-2">
      <Placer />
      <div className="mt-2 flex flex-col rounded bg-theme-surface-main">
        <Button
          variant="transparent"
          className={twMerge('border-b border-b-theme-primary p-2 text-[#A3A3A3]')}
          iconContainerClassName="m-0"
          startIcon={<TbPointer />}
          title="Pointer"
          onClick={() => EditorControlFunctions.replaceSelection([])}
        />
        <Button
          variant="transparent"
          className={twMerge(
            'border-b border-b-theme-primary p-2 text-[#A3A3A3]',
            transformMode === TransformMode.translate && 'bg-theme-highlight text-white'
          )}
          iconContainerClassName="m-0"
          startIcon={<TbVector />}
          title="Translate"
          onClick={() => setTransformMode(TransformMode.translate)}
        />
        <Button
          variant="transparent"
          className={twMerge(
            'border-b border-b-theme-primary p-2 text-[#A3A3A3]',
            transformMode === TransformMode.rotate && 'bg-theme-highlight text-white'
          )}
          iconContainerClassName="m-0"
          startIcon={<TbRefresh />}
          title="Rotate"
          onClick={() => setTransformMode(TransformMode.rotate)}
        />
        <Button
          variant="transparent"
          className={twMerge(
            'p-2 text-[#A3A3A3]',
            transformMode === TransformMode.scale && 'bg-theme-highlight text-white'
          )}
          iconContainerClassName="m-0"
          startIcon={<TbWindowMaximize />}
          title="Scale"
          onClick={() => setTransformMode(TransformMode.scale)}
        />
      </div>
    </div>
  )
}
