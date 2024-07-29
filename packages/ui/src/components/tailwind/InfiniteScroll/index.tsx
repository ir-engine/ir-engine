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
  const observerRef = useRef<any>(null)
  const loadMoreRef = useRef<any>(null)

  const onIntersection = (entries) => {
    if (entries[0].isIntersecting && !disableEvent) {
      onScrollBottom()
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(onIntersection, { threshold })

    if (observerRef && loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [disableEvent])

  return (
    <div style={{ all: 'unset' }} ref={observerRef} className={className}>
      {children}
      <div ref={loadMoreRef} className="h-10 w-full"></div>
    </div>
  )
}
