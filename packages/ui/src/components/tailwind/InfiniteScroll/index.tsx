import { useHookstate } from '@etherealengine/hyperflux'
import React, { useEffect, useRef } from 'react'

interface IInfiniteScrollProps {
  onScrollBottom: () => void
  children: React.ReactNode
  disableEvent?: boolean
  threshold?: number
  className?: string
}

export default function InfiniteScroll({
  onScrollBottom,
  threshold = 0.8,
  disableEvent,
  children,
  className
}: IInfiniteScrollProps) {
  const observerTarget = useRef<HTMLDivElement>(null)
  const isIntersecting = useHookstate(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        isIntersecting.set(entries[0].isIntersecting)
        console.log('debug1 is intersect?', entries[0].intersectionRatio, disableEvent)
        if (entries[0].isIntersecting && !disableEvent) {
          console.log('debug1 calling on bottom')
          onScrollBottom()
        }
      },
      { threshold }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => {
      if (observerTarget.current) {
        console.log('debug1 unobserving')
        observer.unobserve(observerTarget.current)
      }
    }
  }, [observerTarget.current, isIntersecting])

  return (
    <div style={{ all: 'unset' }} ref={observerTarget} className={className}>
      {children}
    </div>
  )
}
