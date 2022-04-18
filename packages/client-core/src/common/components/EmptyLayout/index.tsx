import React, { Fragment } from 'react'

import { Alerts } from '../Alerts'
import UIDialog from '../Dialog'

interface Props {
  pageTitle?: string
  children: JSX.Element
}

const EmptyLayout = ({ children, pageTitle }: Props): any => (
  <Fragment>
    <UIDialog />
    <Alerts />
    {children}
  </Fragment>
)

export default EmptyLayout
