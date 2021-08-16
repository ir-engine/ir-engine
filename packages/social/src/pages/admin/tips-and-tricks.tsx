/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import React, { useEffect } from 'react'
import Dashboard from '@xrengine/client-core/src/socialmedia/components/Dashboard'
import ArMediaConsoleTipsAndTricks from '@xrengine/client-core/src/admin/components/TipsAndTricks'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import {
  getTipsAndTricks,
  createTipsAndTricksNew,
  removeTipsAndTricks,
  updateTipsAndTricksAsAdmin
} from '@xrengine/client-core/src/socialmedia/reducers/tips_and_tricks/service'
import { selectTipsAndTricksState } from '@xrengine/client-core/src/socialmedia/reducers/tips_and_tricks/selector'
import { doLoginAuto } from '@xrengine/client-core/src/user/reducers/auth/service'

const mapStateToProps = (state: any): any => {
  return {
    tipsAndTricksState: selectTipsAndTricksState(state)
  }
}
const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getTipsAndTricks: bindActionCreators(getTipsAndTricks, dispatch),
  createTipsAndTricksNew: bindActionCreators(createTipsAndTricksNew, dispatch),
  removeTipsAndTricks: bindActionCreators(removeTipsAndTricks, dispatch),
  updateTipsAndTricksAsAdmin: bindActionCreators(updateTipsAndTricksAsAdmin, dispatch),
  doLoginAuto: bindActionCreators(doLoginAuto, dispatch)
})
interface Props {
  tipsAndTricksState?: any
  getTipsAndTricks?: any
  createTipsAndTricksNew?: any
  removeTipsAndTricks: any
  updateTipsAndTricksAsAdmin: any
  doLoginAuto: any
}

const TipsAndTricks = ({
  tipsAndTricksState,
  getTipsAndTricks,
  createTipsAndTricksNew,
  removeTipsAndTricks,
  updateTipsAndTricksAsAdmin,
  doLoginAuto
}: Props) => {
  const create = (data) => {
    createTipsAndTricksNew(data)
  }
  const deleteTipsAndTricks = (id) => {
    removeTipsAndTricks(id)
  }
  const update = (obj) => {
    updateTipsAndTricksAsAdmin(obj)
  }

  useEffect(() => {
    doLoginAuto(true, true)
    getTipsAndTricks()
  }, [])
  const tipsAndTricksList = tipsAndTricksState?.get('tips_and_tricks')
  return (
    <>
      <div>
        <Dashboard>
          {tipsAndTricksList && (
            <ArMediaConsoleTipsAndTricks
              create={create}
              list={tipsAndTricksList}
              deleteTipsAndTricks={deleteTipsAndTricks}
              update={update}
            />
          )}
        </Dashboard>
      </div>
    </>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(TipsAndTricks)
