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
