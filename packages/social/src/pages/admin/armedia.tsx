/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useEffect } from 'react'

import Dashboard from '@xrengine/social/src/components/Dashboard'
import ArMediaDashboard from '@xrengine/social/src/components/admin/Armedia'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'

import { selectArMediaState } from '@xrengine/social/src/reducers/arMedia/selector'
import { getArMediaService } from '@xrengine/social/src/reducers/arMedia/service'

const mapStateToProps = (state: any): any => {
  return {
    arMediaState: selectArMediaState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getArMedia: bindActionCreators(getArMediaService, dispatch)
})
interface Props {
  arMediaState?: any
  getArMedia?: any
}

const ArMediaPage = ({ arMediaState, getArMedia }: Props) => {
  useEffect(() => getArMedia('admin'), [])
  const arMediaList =
    arMediaState.get('fetching') === false && arMediaState?.get('adminList') ? arMediaState.get('adminList') : null
  return (
    <>
      <div>
        <Dashboard>
          {/* <ArMediaConsole list={arMediaList} /> */}
          <ArMediaDashboard list={arMediaList} />
        </Dashboard>
      </div>
    </>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(ArMediaPage)
