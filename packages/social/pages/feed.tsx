
import React from "react";

import AppFooter from "@xr3ngine/client-core/components/social/Footer";
import Feed from "@xr3ngine/client-core/components/social/Feed";
import AppHeader from "@xr3ngine/client-core/components/social/Header";

import styles from './index.module.scss';

export default function FeedPage() {
   return <div className={styles.viewport}>
      <AppHeader user={{username:'username'}} logo="/assets/logoBlack.png"/>
      <Feed />
      <AppFooter user={{username:'username'}} />
    </div>;
}
