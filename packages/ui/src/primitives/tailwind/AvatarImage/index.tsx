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

import { useHookstate } from '@etherealengine/hyperflux'
import React from 'react'
import { twMerge } from 'tailwind-merge'

const sizes = {
  extraSmall: 'w-6 h-6',
  small: 'w-8 h-8',
  medium: 'w-10 h-10',
  large: 'w-20 h-20',
  extraLarge: 'w-36 h-36'
}

export interface AvatarImageProps extends React.HTMLAttributes<HTMLImageElement> {
  src: string
  size?: keyof typeof sizes
}

const AvatarPlaceholder = ({ className }: { className: string }) => (
  <div className={`${className} relative overflow-hidden bg-gray-100 dark:bg-gray-600`}>
    <svg className="scale-50" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
  </div>
)

const AvatarImage = ({ src, size = 'medium' }: AvatarImageProps) => {
  const imageLoaded = useHookstate(true)
  const twClassName = twMerge(`${sizes[size]} rounded-full`)

  return imageLoaded.value ? (
    <img className={twClassName} src={src} alt={src.split('/').at(-1)} onError={() => imageLoaded.set(false)} />
  ) : (
    <AvatarPlaceholder className={twClassName} />
  )
}

export default AvatarImage
