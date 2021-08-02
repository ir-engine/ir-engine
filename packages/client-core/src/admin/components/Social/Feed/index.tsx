import React from 'react'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { useStyle, useStyles } from './styles'
import SearchFeed from './SearchFeed'
import FeedTable from './FeedTable'

const Feed = () => {
  const classes = useStyles()
  return (
    <React.Fragment>
      <div>
        <Grid container spacing={3} className={classes.marginBottom}>
          <Grid item xs={12} sm={9}>
            <SearchFeed />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button className={classes.createBtn} type="submit" variant="contained">
              Create Feed
            </Button>
          </Grid>
        </Grid>
      </div>
      <FeedTable />
    </React.Fragment>
  )
}

export default Feed
