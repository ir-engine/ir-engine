
import React from "react";
import Router  from "next/router";

import AppFooter from "@xr3ngine/client-core/components/social/Footer";
import Feed from "@xr3ngine/client-core/components/social/Feed";
import AppHeader from "@xr3ngine/client-core/components/social/Header";

import styles from './index.module.scss';

export default function FeedPage() {
   const feedId = Router?.router.query.feedId.toString();

   return <div className={styles.viewport}>
      <AppHeader user={{username:'username'}} logo="/assets/logoBlack.png"/>
      <Feed feedId={feedId}/>
      <AppFooter />
    </div>;
}
