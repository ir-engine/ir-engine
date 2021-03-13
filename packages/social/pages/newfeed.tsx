
import React from "react";

import AppFooter from "@xr3ngine/client-core/components/social/Footer";
import FeedForm from "@xr3ngine/client-core/components/social/FeedForm";
import AppHeader from "@xr3ngine/client-core/components/social/Header";

import styles from './index.module.scss';

export default function NewFeedPage() {
   return <div className={styles.viewport}>
      <AppHeader user={{username:'username'}} logo="/assets/logoBlack.png"/>
      <FeedForm />
      <AppFooter user={{username:'username'}} />
    </div>;
}
