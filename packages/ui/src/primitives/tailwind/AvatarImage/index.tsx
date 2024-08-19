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

import React from 'react'
import { twMerge } from 'tailwind-merge'

import { useHookstate } from '@ir-engine/hyperflux'

const sizes = {
  extraSmall: 'w-6 h-6',
  small: 'w-8 h-8',
  medium: 'w-10 h-10',
  large: 'w-20 h-20',
  extraLarge: 'w-36 h-36',
  fill: ''
}

export interface AvatarImageProps extends React.HTMLAttributes<HTMLImageElement> {
  src: string
  size?: keyof typeof sizes
  name?: string
}

const AvatarPlaceholder = ({ className, label }: { className: string; label: string }) => (
  <div
    className={twMerge('grid select-none grid-cols-1 place-items-center rounded-lg bg-[#10BCAA] text-white', className)}
  >
    {label}
  </div>
)

const AvatarImage = ({ src, size = 'medium', className, name }: AvatarImageProps) => {
  const imageLoaded = useHookstate(true)
  const twClassName = twMerge(`${sizes[size]}`, className)
  const label = name
    ? name
        .split(' ')
        .map((s) => s[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U'

  return imageLoaded.value ? (
    <img
      className={`${twClassName} rounded-full`}
      src={src}
      alt={src.split('/').at(-1)}
      onError={() => imageLoaded.set(false)}
    />
  ) : (
    <AvatarPlaceholder className={twClassName} label={label} />
  )
}

export default AvatarImage
