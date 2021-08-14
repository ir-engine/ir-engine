import PartyCore from '@xrengine/client-core/src/admin/components/Party'
import { doLoginAuto } from '@xrengine/client-core/src/user/reducers/auth/service'
import React from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'

interface Props {
  doLoginAuto?: any
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  doLoginAuto: bindActionCreators(doLoginAuto, dispatch)
})

const Party = (props: Props) => {
  const { doLoginAuto } = props
  React.useEffect(() => {
    doLoginAuto(false)
  }, [])

  return <PartyCore />
}

export default connect(null, mapDispatchToProps)(Party)
