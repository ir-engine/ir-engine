/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import React, { useEffect } from 'react'
import Dashboard from '@xrengine/client-core/src/socialmedia/components/Dashboard'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import {
  createTheFeedsNew,
  getTheFeedsNew,
  removeTheFeeds,
  updateTheFeedsAsAdmin
} from '@xrengine/client-core/src/socialmedia/reducers/thefeeds/service'
import { doLoginAuto } from '@xrengine/client-core/src/user/reducers/auth/service'
import TheFeedsConsole from '@xrengine/client-core/src/admin/components/Feeds'
import { selectTheFeedsState } from '@xrengine/client-core/src/socialmedia/reducers/thefeeds/selector'

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
  updateTheFeedsAsAdmin: bindActionCreators(updateTheFeedsAsAdmin, dispatch),
  doLoginAuto: bindActionCreators(doLoginAuto, dispatch)
})
interface Props {
  theFeedsState?: any
  getTheFeedsNew?: any
  createTheFeedsNew?: any
  removeTheFeeds: any
  updateTheFeedsAsAdmin: any
  doLoginAuto: any
}

const TheFeeds = ({
  theFeedsState,
  getTheFeedsNew,
  createTheFeedsNew,
  removeTheFeeds,
  updateTheFeedsAsAdmin,
  doLoginAuto
}: Props) => {
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
    doLoginAuto(true, true)
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
