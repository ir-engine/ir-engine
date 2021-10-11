import Button from '@material-ui/core/Button'
import { Grid } from '@material-ui/core'
import AppsIcon from '@material-ui/icons/Apps'
import ViewAgendaIcon from '@material-ui/icons/ViewAgenda'
import React, { useRef, useState, useEffect } from 'react'
import Featured from '../Featured'
import { useTranslation } from 'react-i18next'
import { useMediaQuery } from '@mui/material'
import { useFeedState } from '../../reducers/post/FeedState'
import { useHistory } from 'react-router'

// @ts-ignore
import styles from './FeedMenu.module.scss'

const FeedMenu = () => {
  const containerRef = useRef<HTMLInputElement>()
  const featuredRef = useRef<HTMLInputElement>()
  const creatorsRef = useRef<HTMLInputElement>()
  const { t } = useTranslation()
  const [view, setView] = useState(null)
  const [viewType, setViewType] = useState('grid')
  const [isFeatured, setIsFeatured] = useState(false)
  const match = useMediaQuery('(max-width:1279px)')
  const feedsState = useFeedState()
  const history = useHistory()

  useEffect(() => {}, [view, isFeatured])

  useEffect(() => {
    match && setViewType('list')
  }, [match])

  useEffect(() => {
    if (!!!feedsState.feeds.feedsFiredFetching.value && !!feedsState.feeds.feedsFired.value.length && view === null) {
      console.log('set view')
      setView('featured')
    }
  }, [feedsState.feeds.feedsFiredFetching.value])

  const padding = 40
  const handleMenuClick = (view) => {
    setView(view)
    let leftScrollPos = 0
    switch (view) {
      case 'all':
        leftScrollPos = creatorsRef.current.offsetLeft - padding
        history.push({
          search: '?tag=all'
        })
        break
      default:
        history.push({
          search: '?tag=featured'
        })
        leftScrollPos = 0
        break
    }
    containerRef.current.scrollTo({ left: leftScrollPos, behavior: 'smooth' })
  }
  let content = null
  switch (view) {
    case 'all':
      content = <Featured viewType={viewType} setIsFeatured={setIsFeatured} isFeatured={isFeatured} />
      break
    default:
      content = <Featured type="fired" viewType={viewType} setIsFeatured={setIsFeatured} isFeatured={isFeatured} />
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
                variant={view === 'featured' ? 'contained' : 'text'}
                ref={featuredRef}
                className={
                  styles.switchButton +
                  (view === 'featured' ? ' ' + styles.active : '') +
                  (view === 'all' && !isFeatured ? ' ' + styles.disabled : '')
                }
                disabled={view === 'all' && !isFeatured}
                onClick={() => {
                  handleMenuClick('featured')
                }}
              >
                Featured
              </Button>
              <Button
                variant={view === 'all' ? 'contained' : 'text'}
                ref={creatorsRef}
                className={styles.switchButton + (view === 'all' ? ' ' + styles.active : '')}
                onClick={() => {
                  handleMenuClick('all')
                }}
              >
                All
              </Button>
            </section>
          </Grid>
          <section className={styles.viewSwitcher} style={match ? { display: 'none' } : {}}>
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
