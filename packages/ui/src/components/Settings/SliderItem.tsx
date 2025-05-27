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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import React, { useState } from 'react'

interface SliderItemProps {
  label: string
  defaultValue?: number
}

const SliderItem: React.FC<SliderItemProps> = ({ label, defaultValue = 50 }) => {
  const [value, setValue] = useState(defaultValue)

  return (
    <div className="flex items-center justify-between px-4 py-3.5 text-white/90">
      <span className="flex-1 font-medium">{label}</span>
      <div className="flex flex-1 items-center space-x-3">
        <div className="relative w-full">
          <div
            className="relative h-4 w-full rounded-full"
            style={{
              background: 'rgba(0, 0, 0, 0.14)',
              boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25) inset'
            }}
          >
            <div
              className="absolute left-0 top-0 h-4 rounded-full"
              style={{
                width: `${value}%`,
                backgroundColor: 'hsla(211, 47%, 53%, 1)'
              }}
            />
            <div
              className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg"
              style={{ left: `${value}%` }}
            />
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={(e) => setValue(parseInt(e.target.value))}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>
      </div>
    </div>
  )
}

export default SliderItem
