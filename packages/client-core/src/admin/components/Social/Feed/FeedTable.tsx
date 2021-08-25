import React from 'react'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import { useStyle, useStyles } from './styles'
import { getAdminFeeds, deleteFeed } from '../../../reducers/admin/Social/feeds/service'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { selectAdminFeedsState } from '../../../reducers/admin/Social/feeds/selector'
import { selectAuthState } from '../../../../user/reducers/auth/selector'
import Grid from '@material-ui/core/Grid'
import CardData from './CardData'
import ViewFeed from './ViewFeed'

interface Props {
  getAdminFeeds?: () => void
  deleteFeed?: (id) => void
  feedState?: any
  authState?: any
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getAdminFeeds: bindActionCreators(getAdminFeeds, dispatch),
  deleteFeed: bindActionCreators(deleteFeed, dispatch)
})

const mapStateToProps = (state: any): any => {
  return {
    authState: selectAuthState(state),
    feedState: selectAdminFeedsState(state)
  }
}

const FeedTable = (props: Props) => {
  const { getAdminFeeds, deleteFeed, authState, feedState } = props
  const classex = useStyle()
  const classes = useStyles()

  const user = authState.get('user')
  const feeds = feedState.get('feeds')
  const adminFeeds = feeds.get('feeds')

  const [openViewModal, setOpenViewModal] = React.useState(false)
  const [feedAdmin, setFeedAdmin] = React.useState('')
  const [showWarning, setShowWarning] = React.useState(false)
  const [feedId, setFeedId] = React.useState('')

  React.useEffect(() => {
    if (user.id && feeds.get('updateNeeded')) {
      getAdminFeeds()
    }
  }, [user, getAdminFeeds, feeds])

  const openViewModalHandler = (open: boolean, feed: any) => {
    setFeedAdmin(feed)
    setOpenViewModal(open)
  }

  const deleteFeedHandler = () => {
    setShowWarning(false)
    deleteFeed(feedId)
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
