import React from 'react'
import BotsCore from '@xrengine/client-core/src/admin/components/Bots'
import { doLoginAuto } from '@xrengine/client-core/src/user/reducers/auth/service'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

interface Props {
  doLoginAuto?: any
}
const mapDispatchToProps = (dispatch: Dispatch): any => ({
  doLoginAuto: bindActionCreators(doLoginAuto, dispatch)
})

const Bots = (props: Props) => {
  const { doLoginAuto } = props
  React.useEffect(() => {
    doLoginAuto(false)
  }, [])

  return <BotsCore />
}

export default connect(null, mapDispatchToProps)(Bots)
