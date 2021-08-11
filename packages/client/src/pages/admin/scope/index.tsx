import React from 'react'
import ScopeConsole from '@xrengine/client-core/src/admin/components/Scope'
import { doLoginAuto } from '@xrengine/client-core/src/user/reducers/auth/service'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'

interface Props {
  doLoginAuto?: any
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  doLoginAuto: bindActionCreators(doLoginAuto, dispatch)
})

const Scope = (props: Props) => {
  const { doLoginAuto } = props
  React.useEffect(() => {
    doLoginAuto(false)
  }, [])
  return <ScopeConsole />
}

export default connect(null, mapDispatchToProps)(Scope)
