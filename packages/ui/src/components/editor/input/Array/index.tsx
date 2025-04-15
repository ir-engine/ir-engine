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
import { SupportedFileTypes } from '@ir-engine/editor/src/constants/AssetTypes'
import { NO_PROXY, useHookstate, useState } from '@ir-engine/hyperflux'
import React, { ReactNode, useCallback, useEffect } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { HiMinus, HiPlus } from 'react-icons/hi'
import { MdDragIndicator } from 'react-icons/md'
import { twMerge } from 'tailwind-merge'
import { v4 as uuidv4 } from 'uuid'
import Button from '../../../../primitives/tailwind/Button'
import Input from '../../../../primitives/tailwind/Input'

const ItemType = {
  inputElement: 'inputElement'
}

interface InputElement {
  uuid: string
  value: string
}

export interface ArrayInputProps {
  name?: string
  containerClassName?: string
  values: string[] | ReactNode[]
  renderFunction?: (value: string | ReactNode) => ReactNode
  onChange: (values: string[]) => void
  onSelect?: (index: number) => void
  dropTypes?: string[]
  SelectIcon?: ({ className }: { className?: string }) => JSX.Element
  selectedIndex?: number
}

const DiscardableInput = ({
  value,
  index,
  onChange,
  onSelect,
  dropTypes,
  SelectIcon,
  selected,
  inputElement,
  moveInputElement,
  findInputElement,
  renderFunction
}: {
  value: string
  index: number
  onChange: (val: string, idx: number) => void
  onSelect?: (idx: number) => void
  SelectIcon?: ({ className }: { className?: string }) => JSX.Element
  selected?: boolean
  inputElement: InputElement
  moveInputElement: (inputElementUUID: string, atIndex: number) => void
  findInputElement: (inputElementUUID: string) => {
    inputElement: InputElement | undefined
    index: number
  }
  renderFunction?: (value: string | ReactNode) => ReactNode
} & Pick<ArrayInputProps, 'dropTypes'>) => {
  const originalIndex = () => {
    if (findInputElement) {
      return findInputElement(value).index
    } else {
      return undefined
    }
  }
  const [{ opacity }, dragSourceRef, previewRef] = useDrag({
    type: ItemType.inputElement,
    item: { uuid: inputElement?.uuid, index: originalIndex },
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0 : 1
    })
  })

  const [{ isDroppable: isInputElementDroppable }, inputElementDropRef] = useDrop(() => ({
    accept: ItemType.inputElement,
    hover({ uuid: draggedtrackUUID }: { uuid: string; index: number }) {
      if (draggedtrackUUID !== inputElement.uuid) {
        const { index: overIndex } = findInputElement(inputElement.uuid)
        moveInputElement(draggedtrackUUID, overIndex)
      }
    },
    collect: (monitor) => ({
      isDroppable: monitor.canDrop() && monitor.isOver()
    })
  }))

  const [{ isDroppable: isFileDroppable }, fileDropRef] = useDrop(() => ({
    accept: dropTypes ?? [...SupportedFileTypes],
    drop: (item: { url: string }) => {
      onChange(item.url, index)
    },
    collect: (monitor) => ({
      isDroppable: monitor.canDrop() && monitor.isOver()
    })
  }))

  return (
    <div
      className={twMerge(' flex w-full gap-2', isInputElementDroppable && 'outline outline-2 outline-white')}
      ref={(node) => {
        inputElementDropRef(previewRef(node))
      }}
    >
      <div
        ref={fileDropRef}
        className={twMerge('flex w-full justify-end gap-1', isFileDroppable && 'outline outline-2 outline-white')}
      >
        <div ref={dragSourceRef} className=" flex h-full w-6 cursor-move items-center text-2xl text-text-inactive">
          <MdDragIndicator />
        </div>
        {renderFunction ? (
          renderFunction(value)
        ) : (
          <Input fullWidth={true} value={value} onChange={(event) => onChange(event.target.value, index)} />
        )}

        {SelectIcon && (
          <Button
            className={twMerge(
              'h-8 w-9 rounded-md p-1',
              selected ? 'bg-ui-primary text-text-primary-button' : 'bg-surface-2 text-text-inactive'
            )}
            onClick={() => {
              if (onSelect) {
                onSelect(index)
              }
            }}
          >
            <SelectIcon className="h-6 w-6" />
          </Button>
        )}
      </div>
    </div>
  )
}

export default function ArrayInputGroup({
  name,
  containerClassName,
  values: initialValues,
  renderFunction,
  onChange,
  dropTypes,
  SelectIcon,
  onSelect,
  selectedIndex
}: ArrayInputProps) {
  const buildInputElements = () => {
    const returnArray = [] as InputElement[]
    initialValues.forEach(function (val) {
      returnArray.push({
        uuid: uuidv4(),
        value: val
      })
    })
    return returnArray
  }

  const localSelectIndex = useState(selectedIndex)
  localSelectIndex.set(selectedIndex)
  const inputElements = useHookstate(buildInputElements() as InputElement[])

  const buildValueArrayFromInputElements = (inputElements: InputElement[]) => {
    const returnArray = [] as string[]
    inputElements.forEach(function (inputElement) {
      returnArray.push(inputElement.value)
    })
    return returnArray
  }

  const handleChange = useCallback(
    (value: string, index: number, addRemove?: 'add' | 'remove') => {
      const prevValues = inputElements.get(NO_PROXY)

      let newValues = [] as InputElement[]

      if (addRemove === 'add') {
        newValues = [...prevValues, { uuid: uuidv4(), value: value }]
      } else if (addRemove === 'remove') {
        newValues = prevValues.filter((_, idx) => idx !== index)
      } else {
        newValues = prevValues.map((v, idx) => (idx === index ? { uuid: prevValues[idx].uuid, value: value } : v))
      }
      inputElements.set(newValues)
    },
    [onChange]
  )

  const [{ isGroupDroppable }, groupDropRef] = useDrop(
    () => ({
      accept: dropTypes ?? [...SupportedFileTypes],
      drop: (item: { url: string }, monitor) => {
        if (monitor.didDrop()) {
          return // don't handle the drop if a child component already did
        }
        handleChange(item.url, 0, 'add')
      },
      collect: (monitor) => ({
        isGroupDroppable: monitor.canDrop() && monitor.isOver({ shallow: true })
      })
    }),
    [handleChange]
  )

  const findInputElement = (inputElementUUID: string) => {
    for (let i = 0; i < inputElements.length; i++) {
      const ie = inputElements.get(NO_PROXY)[i]
      if (ie.uuid === inputElementUUID) {
        return {
          inputElement: ie,
          index: i
        }
      }
    }
    return {
      inputElement: undefined,
      index: -1
    }
  }

  const moveInputElement = (inputElementUUID: string, atIndex: number) => {
    const { inputElement, index } = findInputElement(inputElementUUID)
    if (inputElement && index !== -1) {
      const newinputElements = inputElements.get(NO_PROXY) as InputElement[]
      newinputElements.splice(index, 1)
      newinputElements.splice(atIndex, 0, inputElement)
      inputElements.set(newinputElements)
    }
  }

  const [, drop] = useDrop(() => ({ accept: ItemType.inputElement }))

  useEffect(() => {
    onChange(buildValueArrayFromInputElements(inputElements.get(NO_PROXY) as InputElement[]))
  }, [inputElements])

  return (
    <div ref={groupDropRef} aria-label={name} className={twMerge('w-full ', containerClassName)}>
      <div
        className={`outline outline-2 transition-colors duration-200 ${
          isGroupDroppable ? 'outline-white' : 'outline-transparent'
        }`}
      >
        {inputElements.length > 0 && (
          <DndProvider backend={HTML5Backend} key="InputElementDropArea">
            <div ref={drop} className="grid w-full grid-cols-1 space-y-1 py-1.5 ">
              {inputElements.get(NO_PROXY).map((inputElement, idx) => (
                <DiscardableInput
                  key={inputElement.value + idx}
                  value={inputElement.value}
                  index={idx}
                  onChange={handleChange}
                  dropTypes={dropTypes}
                  SelectIcon={SelectIcon}
                  onSelect={onSelect}
                  selected={localSelectIndex.value === idx}
                  inputElement={inputElement}
                  moveInputElement={moveInputElement}
                  findInputElement={findInputElement}
                  renderFunction={renderFunction}
                />
              ))}
            </div>
          </DndProvider>
        )}
        <div className="my-1 flex w-full justify-end gap-1">
          {inputElements.length > 0 && (
            <button
              className=" h-8 w-9 cursor-pointer rounded-md bg-surface-2 text-text-primary-button"
              onClick={() => handleChange('', inputElements.length - 1, 'remove')}
            >
              <HiMinus className="m-auto" />
            </button>
          )}
          <button
            className=" h-8 w-8 cursor-pointer rounded-md bg-surface-2 text-text-primary-button"
            onClick={() => handleChange('', 0, 'add')}
          >
            <HiPlus className="m-auto" />
          </button>
        </div>
      </div>
    </div>
  )
}
