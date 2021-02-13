import React, { Fragment } from 'react';
import { Alerts } from '../Common/Alerts';
import { UIDialog } from '../Dialog/Dialog';

interface Props {
  children: any;
}

export const EmptyLayout = ({ children }: Props): any => (
  <Fragment>
    <UIDialog />
    <Alerts />
    {children}
  </Fragment>
);
