import * as React from 'react'
import Alerts from '../Common/Alerts'
import XDialog from '../Dialog/Dialog'

type Props = {
  children: any
}

class EmptyLayout extends React.Component<Props> {
  render() {
    return (
      <React.Fragment>
        <XDialog/>

        <Alerts/>

        {this.props.children}
      </React.Fragment>
    )
  }
}

export default EmptyLayout
