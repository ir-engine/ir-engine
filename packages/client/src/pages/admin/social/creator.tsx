import React from 'react'
import Creator from '@xrengine/client-core/src/admin/components/Social/Creator/index'
import { doLoginAuto } from '@xrengine/client-core/src/user/reducers/auth/service'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'

interface Props {
  doLoginAuto?: any
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  doLoginAuto: bindActionCreators(doLoginAuto, dispatch)
})

const CreatorPage = (props: Props) => {
  const { doLoginAuto } = props
  React.useEffect(() => {
    doLoginAuto(false)
  }, [])
  return (
    <div>
      <Creator />
    </div>
  )
}

export default connect(null, mapDispatchToProps)(CreatorPage)
