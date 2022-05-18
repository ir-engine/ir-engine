import React, { useState, useRef, useEffect } from 'react'
import { StoryItem } from './StoryItem'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import styles from './Stories.module.scss'

export function Stories({ stories }: any) {
  const [x, setX] = useState(0)
  const [maxItems, setMaxItems] = useState(7)
  const [min_X, setMinX] = useState(0)

  const windowRef = useRef(null)

  useEffect(() => {
    if (windowRef.current && windowRef.current.clientWidth > 0) {
      ;((windowRef.current && windowRef.current.clientWidth / 80) | 0) !== maxItems &&
        ((windowRef.current && windowRef.current.clientWidth / 80) | 0) <= 7 &&
        setMaxItems((windowRef.current && windowRef.current.clientWidth / 80) | 0)

      setMinX(-((stories?.length - maxItems) * 80 + (5 - maxItems) * 15))
    }
  })

  const calculateTransform = (newX: any) => {
    if (newX < min_X) setX(min_X)
    else if (newX > 0) setX(0)
    else setX(newX)
  }

  return (
    <section className={styles.storiesContainer}>
      <div className={styles.storiesFeed} ref={windowRef}>
        {x !== 0 && <ArrowBackIosIcon className={styles.backIcon} onClick={() => calculateTransform(x + 320)} />}
        <div className={styles.storiesFeedFloating} style={{ transform: `translate(${x}px, 0px)` }}>
          {stories && stories.map((item: any, index) => <StoryItem data={item} key={index} />)}
        </div>
        {x !== min_X && stories?.length > maxItems && (
          <ArrowForwardIosIcon className={styles.forwardIcon} onClick={() => calculateTransform(x - 320)} />
        )}
      </div>
    </section>
  )
}
