import React, { useEffect, useRef } from 'react'
import { twMerge } from 'tailwind-merge'
import ImageUrlFallback from './image-url-fallback.png'

export interface ImageLinkProps {
  value: string
  variant?: 'lg' | 'md' | 'sm'
  onChange: (value: string) => void
}

const containerVariants = {
  lg: 'h-[405px] w-[330px] p-4',
  md: 'h-[280px] w-[280px] p-2',
  sm: 'h-[190px] w-[190px] p-2'
}

const imageVariants = {
  lg: 'max-h-[310px] max-w-[300px]',
  md: 'max-h-[210px] max-w-[265px]',
  sm: 'max-h-[120px] max-w-[175px]'
}

export default function ImageLink({ value, onChange, variant = 'md' }: ImageLinkProps) {
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!imageRef.current) return
    imageRef.current.onerror = () => {
      if (!imageRef.current) return
      imageRef.current.src = ImageUrlFallback
    }
  }, [])

  return (
    <div className={twMerge('rounded-[10px] bg-[#191B1F]', containerVariants[variant])}>
      <img src={value} className={twMerge('mx-auto rounded', imageVariants[variant])} ref={imageRef} />
      <button className={twMerge('float-right text-sm text-[#AFBEDF]', variant === 'lg' ? 'mt-2' : 'mt-1')}>
        Clear
      </button>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={twMerge(
          'w-full rounded bg-[#080808] px-2 py-1 text-xs text-[#9CA3AF]',
          variant === 'lg' ? 'mt-2' : 'mt-1'
        )}
      />
    </div>
  )
}
