import React, { useEffect } from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import Feed from '@xrengine/client-core/src/admin/components/Social/Feed'
import { doLoginAuto } from '@xrengine/client-core/src/user/reducers/auth/service'

interface Props {
  doLoginAuto?: any
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  doLoginAuto: bindActionCreators(doLoginAuto, dispatch)
})

/**
 * @author KIMENYI Kevin <kimenyikevin@gmail.com>
 */
const FeedsPage = (props: Props) => {
  const { doLoginAuto } = props
  useEffect(() => {
    doLoginAuto(false)
  }, [])
  return <Feed />
}

export default connect(null, mapDispatchToProps)(FeedsPage)
