import React from 'react'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import { useFeedStyle, useFeedStyles } from './styles'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { selectAuthState } from '@xrengine/client-core/src/user/reducers/auth/selector'
import Grid from '@material-ui/core/Grid'
import CardData from './CardData'
import ViewFeed from './ViewFeed'
import { getFeeds, removeFeed } from '../../../reducers/feed/service'
import { selectFeedsState } from '../../../reducers/feed/selector'

interface Props {
  getAdminFeeds?: typeof getFeeds
  removeFeed?: typeof removeFeed
  feedState?: any
  authState?: any
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getAdminFeeds: bindActionCreators(getFeeds, dispatch),
  removeFeed: bindActionCreators(removeFeed, dispatch)
})

const mapStateToProps = (state: any): any => {
  return {
    authState: selectAuthState(state),
    feedState: selectFeedsState(state)
  }
}

const FeedTable = (props: Props) => {
  const { getAdminFeeds, removeFeed, authState, feedState } = props
  const classex = useFeedStyle()
  const classes = useFeedStyles()

  const user = authState.get('user')
  const feeds = feedState.get('feedsAdmin')
  const adminFeeds = feeds.get('feeds')

  const [openViewModal, setOpenViewModal] = React.useState(false)
  const [feedAdmin, setFeedAdmin] = React.useState('')
  const [showWarning, setShowWarning] = React.useState(false)
  const [feedId, setFeedId] = React.useState('')

  React.useEffect(() => {
    if (user.id && feeds.get('updateNeeded')) {
      getAdminFeeds('admin')
    }
  }, [user, getAdminFeeds, feeds])

  const openViewModalHandler = (open: boolean, feed: any) => {
    setFeedAdmin(feed)
    setOpenViewModal(open)
  }

  const deleteFeedHandler = () => {
    setShowWarning(false)
    const feed = adminFeeds.find((feed) => feed.id === feedId)
    removeFeed(feedId, feed.previewId, feed.videoId)
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

  const rows = adminFeeds.map((feed, index) => {
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

export default connect(mapStateToProps, mapDispatchToProps)(FeedTable)
