import Button from '@material-ui/core/Button'
import React, { useRef, useState } from 'react'
import Featured from '../Featured'
import { useTranslation } from 'react-i18next'

// @ts-ignore
import styles from './FeedMenu.module.scss'

const FeedMenu = () => {
  const containerRef = useRef<HTMLInputElement>()
  const featuredRef = useRef<HTMLInputElement>()
  const creatorsRef = useRef<HTMLInputElement>()
  const { t } = useTranslation()
  const [type, setType] = useState('featured')
  const [view, setView] = useState('')

  const padding = 40
  const handleMenuClick = (view) => {
    setView(view)
    let leftScrollPos = 0
    switch (view) {
      case 'all':
        leftScrollPos = creatorsRef.current.offsetLeft - padding
        break
      default:
        leftScrollPos = 0
        break
    }
    containerRef.current.scrollTo({ left: leftScrollPos, behavior: 'smooth' })
  }
  let content = null
  switch (view) {
    case 'all':
      content = <Featured />
      break
    default:
      content = <Featured type="creator" />
      break
  }
  const classes = {
    featured: [styles.featuredButton, view === 'featured' && styles.active],
    all: [styles.creatorsButton, view === 'all' && styles.active]
  }
  return (
    <>
      <nav className={styles.feedMenuContainer}>
        <section className={styles.switcher} ref={containerRef}>
          <Button
            variant={type === 'featured' ? 'contained' : 'text'}
            ref={featuredRef}
            className={styles.switchButton + (type === 'featured' ? ' ' + styles.active : '')}
            onClick={() => {
              handleMenuClick('featured')
              setType('featured')
            }}
          >
            Featured
          </Button>
          <Button
            variant={type === 'all' ? 'contained' : 'text'}
            ref={creatorsRef}
            className={styles.switchButton + (type === 'all' ? ' ' + styles.active : '')}
            onClick={() => {
              handleMenuClick('all')
              setType('all')
            }}
          >
            All
          </Button>
        </section>
      </nav>
      <section className={styles.content}>{content}</section>
    </>
  )
}

export default FeedMenu
