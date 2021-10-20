import Button from '@material-ui/core/Button'
import { Grid } from '@material-ui/core'
import AppsIcon from '@material-ui/icons/Apps'
import ViewAgendaIcon from '@material-ui/icons/ViewAgenda'
import React, { useRef, useState, useEffect } from 'react'
import Featured from '../Featured'
import { useTranslation } from 'react-i18next'
import { useMediaQuery } from '@mui/material'
import { useFeedState } from '@standardcreative/client-core/src/social/state/FeedState'
import { useHistory, useLocation } from 'react-router'

// @ts-ignore
import styles from './FeedMenu.module.scss'

const FeedMenu = () => {
  const containerRef = useRef<HTMLInputElement>()
  const featuredRef = useRef<HTMLInputElement>()
  const creatorsRef = useRef<HTMLInputElement>()
  const { t } = useTranslation()
  const [view, setView] = useState(null)
  const [viewType, setViewType] = useState('gallery')
  const [isFeatured, setIsFeatured] = useState(false)
  const [firstRun, setFirstRun] = useState(null)
  const feedsState = useFeedState()
  const history = useHistory()
  const location = useLocation()

  useEffect(() => {
    if (view === null) {
      const params = new URLSearchParams(location.search)
      if (params.get('tag') && ['all', 'featured'].includes(params.get('tag'))) {
        setView(params.get('tag'))
      }
    }
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (firstRun && !params.get('tag') && !!!feedsState.feeds.feedsFiredFetching.value && view === null) {
      if (!!feedsState.feeds.feedsFired.value.length) {
        setView('featured')
        history.push({
          pathname: '/',
          search: '?tag=featured'
        })
      } else {
        setView('all')
        history.push({
          pathname: '/',
          search: '?tag=all'
        })
      }
    }
    if (firstRun === null && feedsState.feeds.feedsFiredFetching.value) {
      setFirstRun(true)
    }
  }, [feedsState.feeds.feedsFiredFetching.value, firstRun])

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

  useEffect(() => {
    if (view === 'featured' && !isFeatured) {
      setView('all')
      history.push({
        pathname: '/',
        search: 'tag=all'
      })
    }
  }, [view, isFeatured])

  const handleViewTypeSwitch = (type): void => {
    const params = new URLSearchParams(location.search)
    switch (type) {
      case 'gallery':
        setViewType('gallery')
        params.set('view', 'gallery')
        history.push({
          pathname: location.pathname,
          search: params.toString()
        })
        break

      case 'blog':
        setViewType('blog')
        params.set('view', 'blog')
        history.push({
          pathname: location.pathname,
          search: params.toString()
        })
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
            <section
              className={`${styles.switcher}${
                !!feedsState.feeds.feedsFired.value.length || isFeatured ? ` ${styles.switcherActive}` : ''
              }`}
              ref={containerRef}
            >
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
          <Grid item>
            <section className={styles.viewSwitcher}>
              <Button
                variant={viewType === 'gallery' ? 'contained' : 'text'}
                className={styles.viewSwitchButton + (viewType === 'gallery' ? ' ' + styles.viewActive : '')}
                onClick={() => handleViewTypeSwitch('gallery')}
              >
                <AppsIcon style={{ margin: '10px 0' }} />
              </Button>
              <Button
                variant={viewType === 'blog' ? 'contained' : 'text'}
                className={styles.viewSwitchButton + (viewType === 'blog' ? ' ' + styles.viewActive : '')}
                onClick={() => handleViewTypeSwitch('blog')}
              >
                <ViewAgendaIcon />
              </Button>
            </section>
          </Grid>
        </Grid>
      </nav>
      <section className={styles.content}>{content}</section>
    </>
  )
}

export default FeedMenu
