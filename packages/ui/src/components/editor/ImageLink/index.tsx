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

import React, { ImgHTMLAttributes, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'
import ImageUrlFallback from './image-url-fallback.png'

export interface ImageLinkProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'onChange' | 'onBlur'> {
  variant?: 'lg' | 'md' | 'sm' | 'full'
  onChange?: (value: string) => void
  onBlur?: (value: string) => void
}

const containerVariants = {
  full: 'h-[405px] w-full p-4 gap-y-2',
  lg: 'h-[405px] w-[330px] p-4 gap-y-2',
  md: 'h-[280px] w-[280px] p-2 gap-y-1',
  sm: 'h-[190px] w-[190px] p-2 gap-y-1'
}

const imageVariants = {
  full: 'h-[310px] w-full',
  lg: 'h-[310px] w-[297px]',
  md: 'h-[210px] w-[264px]',
  sm: 'h-[119px] w-[174px]'
}

/**
 * component for displaying an image in the properties panel, provided an `src`
 *
 * props are passed to `<img />`
 *
 * @param props.onChange callback to display an input and receive the new value on each keystroke
 * @param props.onBlur callback to display an input and receive the new value when the input loses focus
 */
export default function ImageLink({ src, onChange, onBlur, variant = 'full', ...props }: ImageLinkProps) {
  const { t } = useTranslation()
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!imageRef.current) return
    const onErrorCallback = () => {
      if (!imageRef.current) return
      imageRef.current.src = ImageUrlFallback
    }

    imageRef.current.addEventListener('error', onErrorCallback)

    return () => {
      if (!imageRef.current) return
      imageRef.current.removeEventListener('error', onErrorCallback)
    }
  }, [])

  useEffect(() => {
    if (!src && imageRef.current) {
      imageRef.current.src = ImageUrlFallback
    }
  }, [src])

  return (
    <div className={twMerge('flex flex-col rounded-[10px] bg-[#191B1F]', containerVariants[variant])}>
      <img
        src={src}
        className={twMerge(
          'mx-auto rounded',
          imageVariants[variant],
          !onChange && !onBlur && variant === 'full' && 'h-[370px]'
        )}
        ref={imageRef}
        {...props}
      />
      {(onChange || onBlur) && (
        <>
          <button
            className="text-right text-sm text-[#AFBEDF]"
            onClick={() => {
              onChange?.('')
              onBlur?.('')
            }}
          >
            {t('common:components.clear')}
          </button>
          <input
            value={src}
            onChange={(event) => onChange?.(event.target.value)}
            onBlur={(event) => onBlur?.(event.target.value)}
            className="w-full rounded bg-[#080808] px-2 py-1 text-xs text-[#9CA3AF]"
          />
        </>
      )}
    </div>
  )
}
