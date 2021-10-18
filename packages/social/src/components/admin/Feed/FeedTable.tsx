import React from 'react'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import { useFeedStyle, useFeedStyles } from './styles'
import { useDispatch } from '@xrengine/client-core/src/store'
import { bindActionCreators, Dispatch } from 'redux'
import { useAuthState } from '@xrengine/client-core/src/user/state/AuthState'
import Grid from '@material-ui/core/Grid'
import CardData from './CardData'
import ViewFeed from './ViewFeed'
import { FeedService } from '@xrengine/client-core/src/social/state/FeedService'
import { useFeedState } from '@xrengine/client-core/src/social/state/FeedState'

interface Props {
  feedState?: any
}

const FeedTable = (props: Props) => {
  const {} = props
  const classex = useFeedStyle()
  const classes = useFeedStyles()
  const dispatch = useDispatch()
  const user = useAuthState().user
  const feedState = useFeedState()
  const feeds = feedState.feeds.feedsAdmin
  const adminFeeds = feeds.feeds

  const [openViewModal, setOpenViewModal] = React.useState(false)
  const [feedAdmin, setFeedAdmin] = React.useState('')
  const [showWarning, setShowWarning] = React.useState(false)
  const [feedId, setFeedId] = React.useState('')

  React.useEffect(() => {
    if (user.id.value && feeds.updateNeeded.value) {
      FeedService.getFeeds('admin')
    }
  }, [user.id.value, feeds.updateNeeded.value])

  const openViewModalHandler = (open: boolean, feed: any) => {
    setFeedAdmin(feed)
    setOpenViewModal(open)
  }

  const deleteFeedHandler = () => {
    setShowWarning(false)
    const feed = adminFeeds.value.find((feed) => feed.id === feedId)
    FeedService.removeFeed(feedId, feed.previewId, feed.videoId)
  }

  const closeViewModelHandler = (open) => {
    setOpenViewModal(open)
  }

  const handleShowWarning = (id) => {
    setFeedId(id)
    setShowWarning(true)
  }

  const handleCloseWarning = () => {
    setShowWarning(false)
  }

  const rows = adminFeeds.value.map((feed, index) => {
    return <CardData feed={feed} key={feed.id} openViewModal={openViewModalHandler} deleteFeed={handleShowWarning} />
  })

  return (
    <React.Fragment>
      <div className={classex.root}>
        <Grid container spacing={3}>
          {rows}
        </Grid>
      </div>

      {feedAdmin && <ViewFeed openModal={openViewModal} viewFeed={feedAdmin} closeViewModel={closeViewModelHandler} />}
      <Dialog
        open={showWarning}
        onClose={handleCloseWarning}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle className={classes.alert} id="alert-dialog-title">
          {'Confirm to delete this Feed!'}
        </DialogTitle>
        <DialogContent className={classes.alert}>
          <DialogContentText className={classes.alert} id="alert-dialog-description">
            Deleting this feed can not be recovered!
          </DialogContentText>
        </DialogContent>
        <DialogActions className={classes.alert}>
          <Button onClick={handleCloseWarning} className={classes.spanNone}>
            Cancel
          </Button>
          <Button className={classes.spanDange} onClick={deleteFeedHandler} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  )
}

export default FeedTable
