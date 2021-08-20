/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useEffect } from 'react'

import ArMediaDashboard from '@xrengine/client-core/src/admin/components/Social/Armedia'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'

import { selectArMediaState } from '@xrengine/client-core/src/admin/reducers/admin/Social/arMedia/selector'
import { getArMediaService } from '@xrengine/client-core/src/admin/reducers/admin/Social/arMedia/service'

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
  return <ArMediaDashboard list={arMediaList} />
}

export default connect(mapStateToProps, mapDispatchToProps)(ArMediaPage)
