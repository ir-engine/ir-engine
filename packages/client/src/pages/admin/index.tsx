import Analytics from '@xrengine/client-core/src/admin/components/Analytics/index'
import Dashboard from '@xrengine/client-core/src/user/components/Dashboard/Dashboard'
import { doLoginAuto } from '@xrengine/client-core/src/user/reducers/auth/service'
import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

interface Props {
  doLoginAuto?: any
}

const mapStateToProps = (state: any): any => {
  return {}
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  doLoginAuto: bindActionCreators(doLoginAuto, dispatch)
})

const AdminConsolePage = (props: Props) => {
  const { doLoginAuto } = props

  useEffect(() => {
    doLoginAuto(true)
  }, [])

  return <Analytics />
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminConsolePage)
