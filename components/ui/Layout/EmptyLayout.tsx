import * as React from 'react'
import Alerts from '../Common/Alerts'

type Props = {
  children: any
}

class EmptyLayout extends React.Component<Props> {
  render() {
    return (
      <React.Fragment>
        <Alerts/>
        {this.props.children}
      </React.Fragment>
    )
  }
}

export default EmptyLayout
