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

import { Slider, SliderProps } from '@ir-engine/ui/editor'
import Tooltip from '@ir-engine/ui/src/primitives/tailwind/Tooltip'
import React from 'react'
import { LuInfo } from 'react-icons/lu'

export default function BlockSlider({
  label,
  info,
  value,
  onChange
}: {
  label: string
  info?: string
  value: SliderProps['value']
  onChange: SliderProps['onChange']
}) {
  console.log(info)
  return (
    <>
      <div className="flex items-center gap-x-4 lg:hidden">
        <span className="w-52 text-right text-sm text-text-tertiary" data-testid="slider-label">
          {label}
          {info && (
            <Tooltip content={info}>
              <div>
                <LuInfo className={'h-5 w-5 text-text-inactive hover:text-text-primary'} />
              </div>
            </Tooltip>
          )}
        </span>
        <div className="w-80">
          <Slider max={1} min={0} step={0.01} value={value} onChange={onChange} onRelease={() => {}} label={''} />
        </div>
      </div>
      <div className="hidden lg:block">
        <Slider
          max={1}
          min={0}
          step={0.01}
          value={value}
          info={info}
          onChange={onChange}
          onRelease={() => {}}
          label={label}
        />
      </div>
    </>
  )
}
