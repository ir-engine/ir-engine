import { Fragment } from 'react'
import Alerts from '../Common/Alerts'
import UIDialog from '../Dialog/Dialog'

type Props = {
  children: any
}

const EmptyLayout = ({ children }: Props) => (
  <Fragment>
    <UIDialog />
    <Alerts />
    {children}
  </Fragment>
)

export default EmptyLayout
