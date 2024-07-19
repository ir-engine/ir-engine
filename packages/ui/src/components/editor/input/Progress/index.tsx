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

import React from 'react'

import { HiPause, HiPlay } from 'react-icons/hi2'
import Progress, { ProgressProps } from '../../../../primitives/tailwind/Progress'

export interface ProgressBarProps extends ProgressProps {
  paused: boolean
  totalTime: number
}

export default function ProgressBar({ value, paused, totalTime, ...rest }: ProgressBarProps) {
  console.log('DEBUG value', value)
  return (
    <div className="ml-auto mr-6 flex h-10 w-[314px] flex-row place-items-center gap-2 rounded bg-zinc-900 px-2">
      {paused ? <HiPlay className="text-white" /> : <HiPause className="text-white" />}
      <Progress value={(value / totalTime) * 100} className="w-[173px]" barClassName="bg-blue-800 " />
      <div className="w-[85px] truncate text-right text-sm font-normal leading-normal text-neutral-400">
        {paused
          ? 'Paused'
          : `${Math.floor((totalTime * value) / 100 / 60)}:${Math.floor(
              ((totalTime * value) / 100) % 60
            )}  / ${Math.floor(totalTime / 60)}:${Math.floor(totalTime % 60)} `}
      </div>
    </div>
  )
}

ProgressBar.defaultProps = {}
