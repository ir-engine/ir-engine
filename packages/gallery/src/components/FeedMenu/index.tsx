import Button from '@material-ui/core/Button'
import React, { useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'

import styles from './FeedMenu.module.scss'

const FeedMenu = () => {
  const { t } = useTranslation()
  const [type, setType] = useState('featured')
  const [type2, setType2] = useState('grid')

  const padding = 40
  let content = null

  return (
    <>
      <nav className={styles.feedMenuContainer}>
        <section className={styles.switcher}>
          <Button
            variant={type === 'featured' ? 'contained' : 'text'}
            className={styles.switchButton + (type === 'featured' ? ' ' + styles.active : '')}
            onClick={() => setType('featured')}
          >
            Featured
          </Button>
          <Button
            variant={type === 'all' ? 'contained' : 'text'}
            className={styles.switchButton + (type === 'all' ? ' ' + styles.active : '')}
            onClick={() => setType('all')}
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
