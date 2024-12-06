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

import { Button } from '@ir-engine/ui'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import React, { MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { FiEdit2 } from 'react-icons/fi'
import { HiPencil } from 'react-icons/hi2'
import { twMerge } from 'tailwind-merge'
import { handleSoundEffect } from '../../utils'

interface Props {
  alt?: string
  id?: string
  imageSrc?: string
  isSelected?: boolean
  name?: string
  showChangeButton?: boolean
  type?: 'round' | 'rectangle' | 'thumbnail'
  size?: number
  onChange?: () => void
  onClick?: () => void
}

const Avatar = ({ alt, imageSrc, isSelected, name, showChangeButton, type, size, onChange, onClick }: Props) => {
  const { t } = useTranslation()
  const handleChange = (e: MouseEvent) => {
    e.stopPropagation()
    onChange && onChange()
  }

  if (type === 'rectangle') {
    return (
      <div
        onClick={onClick}
        onPointerUp={handleSoundEffect}
        onPointerEnter={handleSoundEffect}
        className={twMerge(
          'relative box-border flex h-32 max-h-[149px] min-h-32 max-w-[410px] cursor-pointer items-start gap-3 rounded-lg bg-[#191B1F] p-3',
          isSelected ? 'border-2 border-blue-primary' : 'border border-[#42454D] hover:border hover:border-blue-primary'
        )}
      >
        <img className="h-full w-24 max-w-24" src={imageSrc} alt={alt} crossOrigin="anonymous" />
        {showChangeButton && (
          <Button
            size="sm"
            fullWidth={false}
            variant="secondary"
            data-testid="edit-avatar-button"
            className="absolute bottom-3 left-[4.25rem] h-8 w-10 rounded-md border-[#162546] border-opacity-65 text-white"
            onClick={handleChange}
          >
            <FiEdit2 size={16} />
          </Button>
        )}
        <span className="line-clamp-2 w-full text-base font-semibold text-theme-primary">{name}</span>
      </div>
    )
  } else if (type === 'thumbnail') {
    return (
      <div className="flex rounded-full">
        <img
          style={{
            height: 'auto',
            maxWidth: '100%'
          }}
          alt={alt}
          src={imageSrc}
          crossOrigin="anonymous"
          width={`${size}px`}
          height={`${size}px`}
        />
        {!imageSrc && (
          <Text fontWeight="semibold" fontSize="base" className="w-full text-ellipsis text-wrap">
            {t('admin:components.avatar.thumbnailPreview')}
          </Text>
        )}
      </div>
    )
  }

  return (
    <div className="flex rounded-full">
      <img
        style={{
          height: 'auto',
          maxWidth: '100%'
        }}
        alt={alt}
        src={imageSrc}
        crossOrigin="anonymous"
        width={`${size}px`}
        height={`${size}px`}
      />
      {showChangeButton && (
        <Button
          size="xs"
          variant="secondary"
          data-testid="edit-avatar-button"
          className="h-8 w-10 rounded-full border-[#162546] border-opacity-65 text-white"
          onClick={handleChange}
        >
          <HiPencil size={16} />
        </Button>
      )}
    </div>
  )
}

export default Avatar
