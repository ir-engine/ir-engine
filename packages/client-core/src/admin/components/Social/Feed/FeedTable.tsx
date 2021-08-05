import React from 'react'
import { useStyle } from './styles'
import { getAdminFeeds } from '../../../reducers/admin/Social/feeds/service'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { selectAdminFeedsState } from '../../../reducers/admin/Social/feeds/selector'
import { selectAuthState } from '../../../../user/reducers/auth/selector'
import Grid from '@material-ui/core/Grid'
import CardData from './CardData'

interface Props {
  getAdminFeeds?: () => void
  feedState?: any
  authState?: any
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getAdminFeeds: bindActionCreators(getAdminFeeds, dispatch)
})

const mapStateToProps = (state: any): any => {
  return {
    authState: selectAuthState(state),
    feedState: selectAdminFeedsState(state)
  }
}

const FeedTable = (props: Props) => {
  const { getAdminFeeds, authState, feedState } = props
  const classex = useStyle()

  const user = authState.get('user')
  const feeds = feedState.get('feeds')
  const adminFeeds = feeds.get('feeds')
  console.log(adminFeeds)

  React.useEffect(() => {
    if (user.id && feeds.get('updateNeeded')) {
      getAdminFeeds()
    }
  }, [user, getAdminFeeds])

  const rows = adminFeeds.map((feed, index) => {
    return <CardData feed={feed} key={feed.id} />
  })

  return (
    <div className={classex.root}>
      <Grid container spacing={3}>
        {rows}
      </Grid>
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(FeedTable)
