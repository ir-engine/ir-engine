import React, { useState, useEffect, useRef } from 'react'
import styles from './ScrollableElement.module.scss'

type ScrollableElementPropsType = {
  children?: any
  height?: number
  scrollContainerClass?: any
  topShadowClass?: any
  bottomShadowClass?: any
}

const ScrollableElement = (props: ScrollableElementPropsType) => {
  const scrollElement = useRef(null!)
  const [shadows, setShadows] = useState({
    top: false,
    bottom: false
  })

  useEffect(() => {
    adjustShadows()
  }, [])

  const adjustShadows = (e?: any) => {
    if (e) e.stopPropagation()

    const el = scrollElement.current! as HTMLElement

    if (el.clientHeight >= el.scrollHeight) {
      setShadows({ top: false, bottom: false })
      return
    }

    if (el.scrollTop === 0) {
      setShadows({ top: false, bottom: true })
      return
    }

    if (el.scrollTop >= el.scrollHeight - el.clientHeight) {
      setShadows({ top: true, bottom: false })
      return
    }

    setShadows({ top: true, bottom: true })
  }

  return (
    <div className={styles.scrollBlock}>
      <div
        className={styles.scrollContainer + (props.scrollContainerClass ? ' ' + props.scrollContainerClass : '')}
        onScroll={adjustShadows}
        ref={scrollElement}
        style={{ height: 'clamp(240px, 30vh, ' + (props.height || 210) + 'px)' }}
      >
        {props.children}
      </div>
      {shadows.top && <span className={styles.topShadow + (props.topShadowClass ? ' ' + props.topShadowClass : '')} />}
      {shadows.bottom && (
        <span className={styles.bottomShadow + (props.bottomShadowClass ? ' ' + props.bottomShadowClass : '')} />
      )}
    </div>
  )
}

export default ScrollableElement
