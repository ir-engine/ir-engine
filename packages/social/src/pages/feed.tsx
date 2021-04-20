
import React from "react";

import AppFooter from "@xr3ngine/client-core/src/socialmedia/components/Footer";
import Feed from "@xr3ngine/client-core/src/socialmedia/components/Feed";

import { useLocation } from "react-router-dom";
import AppHeader from "@xr3ngine/client-core/src/socialmedia/components/Header";

// @ts-ignore
import styles from './index.module.scss';

export default function FeedPage() {
   const feedId = new URLSearchParams(useLocation().search).get('feedId').toString();
   return <div className={styles.viewport}>
      <AppHeader logo="/assets/logoBlack.png"/>
      <Feed feedId={feedId}/>
      <AppFooter />
    </div>;
}
