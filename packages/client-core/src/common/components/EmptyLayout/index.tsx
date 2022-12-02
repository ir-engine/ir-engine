import React, { Fragment } from 'react'

import UIDialog from '../UIDialog'

interface Props {
  pageTitle?: string
  children: JSX.Element
}

const EmptyLayout = ({ children, pageTitle }: Props): any => (
  <Fragment>
    <UIDialog />
    {children}
  </Fragment>
)

export default EmptyLayout
