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

import { AudioEffectPlayer } from '@ir-engine/engine/src/audio/systems/MediaSystem'
import { SVGIconType } from '@ir-engine/ui/src/icons/types'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import Tooltip, { TooltipProps } from '@ir-engine/ui/src/primitives/tailwind/Tooltip'
import React from 'react'
import { IconType } from 'react-icons'
import { twMerge } from 'tailwind-merge'

interface LocationIconButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  tooltip?: {
    title: string
    position?: TooltipProps['position']
  }
  icon: SVGIconType | IconType
  iconProps?: React.SVGProps<SVGSVGElement>
  loadingState?: boolean
}

function LocationIconButton({
  tooltip,
  icon: Icon,
  iconProps,
  className,
  loadingState = false,
  ...props
}: LocationIconButtonProps) {
  const Button = () => {
    const { ref, className, ...restIconProps } = iconProps || {}

    return (
      <button
        className={twMerge(
          'flex h-[50px] w-[50px] select-none items-center justify-center rounded-full bg-white mdh:h-16 mdh:w-16',
          className
        )}
        onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        {...props}
      >
        {(loadingState && <LoadingView className="h-6 w-6" />) || (
          <Icon
            ref={() => ref}
            className={twMerge('h-[20px] w-[20px] text-[#080808] lg:h-[24px] lg:w-[24px]', className)}
            {...restIconProps}
          />
        )}
      </button>
    )
  }

  return tooltip ? (
    <Tooltip content={tooltip.title} position={tooltip.position || 'bottom'}>
      <Button />
    </Tooltip>
  ) : (
    <Button />
  )
}

export default LocationIconButton
