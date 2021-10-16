/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import React, { useEffect } from 'react'
import Dashboard from '@xrengine/social/src/components/Dashboard'
import { bindActionCreators, Dispatch } from 'redux'
import { connect, useDispatch } from 'react-redux'
import { TheFeedsService } from '@xrengine/client-core/src/social/reducers/thefeeds/TheFeedsService'
import { AuthService } from '@xrengine/client-core/src/user/reducers/auth/AuthService'
import TheFeedsConsole from '@xrengine/social/src/components/admin/Feeds'
import { useTheFeedsState } from '@xrengine/client-core/src/social/reducers/thefeeds/TheFeedsState'

// const thefeeds = '';
// conts Feeds = '';

interface Props {
  //doLoginAuto: typeof AuthService.doLoginAuto
}

const TheFeeds = ({}: //doLoginAuto
Props) => {
  const dispatch = useDispatch()
  const create = (data) => {
    dispatch(TheFeedsService.createTheFeedsNew(data))
  }
  const deleteTheFeed = (id) => {
    dispatch(TheFeedsService.removeTheFeeds(id))
  }
  const update = (obj) => {
    dispatch(TheFeedsService.updateTheFeedsAsAdmin(obj))
  }
  const theFeedsState = useTheFeedsState()

  useEffect(() => {
    dispatch(AuthService.doLoginAuto(true, true))
    dispatch(TheFeedsService.getTheFeedsNew())
  }, [])
  const TheFeedsList = theFeedsState?.thefeeds.value || []
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

export default TheFeeds
