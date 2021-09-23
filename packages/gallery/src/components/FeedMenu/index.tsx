import Button from '@material-ui/core/Button'
import { Grid } from '@material-ui/core'
import AppsIcon from '@material-ui/icons/Apps'
import ViewAgendaIcon from '@material-ui/icons/ViewAgenda'
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
  const [viewType, setViewType] = useState('grid')

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
      content = <Featured viewType={viewType} />
      break
    default:
      content = <Featured type="myFeatured" viewType={viewType} />
      break
  }
  const classes = {
    featured: [styles.featuredButton, view === 'featured' && styles.active],
    all: [styles.creatorsButton, view === 'all' && styles.active]
  }

  const handleViewTypeSwitch = (type): void => {
    switch (type) {
      case 'grid':
        setViewType('grid')
        break

      case 'list':
        setViewType('list')
        break

      default:
        break
    }
  }
  return (
    <>
      <nav className={styles.feedMenuContainer}>
        <Grid container>
          <Grid item xs>
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
          </Grid>
          <section className={styles.viewSwitcher}>
            <Button
              variant={viewType === 'grid' ? 'contained' : 'text'}
              className={styles.viewSwitchButton + (viewType === 'grid' ? ' ' + styles.viewActive : '')}
              onClick={() => handleViewTypeSwitch('grid')}
            >
              <AppsIcon />
            </Button>
            <Button
              variant={viewType === 'list' ? 'contained' : 'text'}
              className={styles.viewSwitchButton + (viewType === 'list' ? ' ' + styles.viewActive : '')}
              onClick={() => handleViewTypeSwitch('list')}
            >
              <ViewAgendaIcon />
            </Button>
          </section>
          <Grid item></Grid>
        </Grid>
      </nav>
      <section className={styles.content}>{content}</section>
    </>
  )
}

export default FeedMenu
