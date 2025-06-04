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

import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import Tooltip, { TooltipProps } from '@ir-engine/ui/src/primitives/tailwind/Tooltip'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'
import { Badge, BaseBadgeProps } from './Badge'

interface MenuButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  tooltip?: {
    title: string
    position?: TooltipProps['position']
  }
  badge?: BaseBadgeProps
  loading?: boolean | undefined
  active?: boolean | undefined
}

const buttonStyles = `
  relative z-10
  inline-flex items-center justify-center

  rounded-full
  -m-2 p-2

  transition-[background]
  transition-transform

  hover:scale-[1.05]
  hover:bg-white/10
`

export const MenuButton = ({ active, tooltip, badge, loading, children, className, ...props }: MenuButtonProps) => {
  const { t } = useTranslation()

  const hasBadge = !!badge

  const button = (
    <button
      className={twMerge(
        buttonStyles,
        active
          ? `
      scale-[1.05]
      bg-white/30
    `
          : ``,
        className
      )}
      {...props}
    >
      <div
        className={twMerge(
          `
            absolute
            inset-0
            z-0
          `,
          loading ? `visible` : `hidden`
        )}
      >
        <LoadingView
          className={twMerge(
            `
              absolute inset-0
              z-10
              p-1
            `
          )}
        />
      </div>

      <Badge show={hasBadge} {...(badge || {})} />
      <span className={loading ? `opacity-0` : `opacity-1`}>{children}</span>
    </button>
  )

  const withTooltip = tooltip ? (
    <Tooltip content={t(tooltip.title)} position={tooltip.position || 'bottom'}>
      {button}
    </Tooltip>
  ) : (
    button
  )

  return withTooltip
}
