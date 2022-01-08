import React, { Fragment } from 'react'

import { Alerts } from '../Alerts'
import { UIDialog } from '../Dialog/Dialog'

interface Props {
  pageTitle?: any
  children: any
}

export const EmptyLayout = ({ children, pageTitle }: Props): any => (
  <Fragment>
    <UIDialog />
    <Alerts />
    {children}
  </Fragment>
)
