/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import React, { useEffect } from 'react'
import Dashboard from '@xrengine/social/src/components/Dashboard'
import { bindActionCreators, Dispatch } from 'redux'
import { connect, useDispatch } from 'react-redux'
import {
  createTheFeedsNew,
  getTheFeedsNew,
  removeTheFeeds,
  updateTheFeedsAsAdmin
} from '@xrengine/social/src/reducers/thefeeds/service'
import { AuthService } from '@xrengine/client-core/src/user/reducers/auth/AuthService'
import TheFeedsConsole from '@xrengine/social/src/components/admin/Feeds'
import { selectTheFeedsState } from '@xrengine/social/src/reducers/thefeeds/selector'

// const thefeeds = '';
// conts Feeds = '';

const mapStateToProps = (state: any): any => {
  return {
    theFeedsState: selectTheFeedsState(state)
  }
}
const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getTheFeedsNew: bindActionCreators(getTheFeedsNew, dispatch),
  createTheFeedsNew: bindActionCreators(createTheFeedsNew, dispatch),
  removeTheFeeds: bindActionCreators(removeTheFeeds, dispatch),
  updateTheFeedsAsAdmin: bindActionCreators(updateTheFeedsAsAdmin, dispatch)
})
interface Props {
  theFeedsState?: any
  getTheFeedsNew?: any
  createTheFeedsNew?: any
  removeTheFeeds: any
  updateTheFeedsAsAdmin: any
}

const TheFeeds = ({
  theFeedsState,
  getTheFeedsNew,
  createTheFeedsNew,
  removeTheFeeds,
  updateTheFeedsAsAdmin
}: Props) => {
  const dispatch = useDispatch()

  const create = (data) => {
    createTheFeedsNew(data)
  }
  const deleteTheFeed = (id) => {
    removeTheFeeds(id)
  }
  const update = (obj) => {
    updateTheFeedsAsAdmin(obj)
  }

  useEffect(() => {
    dispatch(AuthService.doLoginAuto(true, true))
    getTheFeedsNew()
  }, [])
  const TheFeedsList = theFeedsState?.get('thefeeds') ? theFeedsState?.get('thefeeds') : []
  return (
    <>
      <div>
        <Dashboard>
          <TheFeedsConsole create={create} list={TheFeedsList} deleteTheFeed={deleteTheFeed} update={update} />
        </Dashboard>
      </div>
    </>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(TheFeeds)
