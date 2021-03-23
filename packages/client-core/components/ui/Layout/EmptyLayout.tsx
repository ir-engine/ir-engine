import React, { Fragment } from 'react';
import { Alerts } from '../Common/Alerts';
import { UIDialog } from '../Dialog/Dialog';
import Head from "next/head";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const siteTitle: string = publicRuntimeConfig.siteTitle;

interface Props {
  pageTitle?: any;
  children: any;
}

export const EmptyLayout = ({ children, pageTitle }: Props): any => (
  <Fragment>
    <Head>
      <title>
          {siteTitle} | {pageTitle}
      </title>
    </Head>
    <UIDialog />
    <Alerts />
    {children}
  </Fragment>
);
