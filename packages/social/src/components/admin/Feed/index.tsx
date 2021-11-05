import React from 'react'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import { useFeedStyles } from './styles'
import SearchFeed from './SearchFeed'
import FeedTable from './FeedTable'
import FeedModel from './CreateFeed'

const Feed = () => {
  const classes = useFeedStyles()
  const [mediaModalOpen, setMediaModalOpen] = React.useState(false)

  const openModalCreate = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return
    }

    setMediaModalOpen(open)
  }

  const closeViewModel = (open: boolean) => {
    setMediaModalOpen(open)
  }

  return (
    <React.Fragment>
      <div>
        <Grid container spacing={3} className={classes.marginBottom}>
          <Grid item xs={12} sm={9}>
            <SearchFeed />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button className={classes.createBtn} type="submit" variant="contained" onClick={openModalCreate(true)}>
              Create Feed
            </Button>
          </Grid>
        </Grid>
      </div>
      <div className={classes.rootTable}>
        <FeedTable />
      </div>
      {mediaModalOpen && (
        <FeedModel open={mediaModalOpen} handleClose={openModalCreate} closeViewModel={closeViewModel} />
      )}
    </React.Fragment>
  )
}

export default Feed
