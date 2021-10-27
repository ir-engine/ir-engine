import React, { useState } from 'react'

type Props = {
  numItems: number
  itemHeight: number
  renderItem: any
  windowHeight: number
  ScrollWindow: any
}

export const VirtualizedList = (props: Props) => {
  const { numItems, itemHeight, renderItem, windowHeight, ScrollWindow } = props
  // console.log(numItems, itemHeight, windowHeight)
  const [scrollTop, setScrollTop] = useState(0)

  const innerHeight = numItems * itemHeight
  const startIndex = Math.floor(scrollTop / itemHeight)
  const endIndex = Math.min(
    numItems - 1, // don't render past the end of the list
    Math.floor((scrollTop + windowHeight) / itemHeight)
  )

  // console.log(numItems, startIndex, endIndex, innerHeight, scrollTop)

  const items = []
  for (let i = startIndex; i <= endIndex; i++) {
    const item = renderItem(i, {
      position: 'absolute',
      top: `${i * itemHeight}px`,
      width: '100%'
    })
    if (item) {
      items.push(item)
    }
  }
  // console.log(items.length)

  const onScroll = (e) => setScrollTop(e.currentTarget.scrollTop)

  return (
    <div style={{ width: '100%', overflowY: 'scroll' }} onScroll={onScroll}>
      <ScrollWindow style={{ position: 'relative', width: '100%', height: `${innerHeight}px` }}>{items}</ScrollWindow>
    </div>
  )
}
