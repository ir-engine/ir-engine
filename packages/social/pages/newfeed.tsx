
import React from "react";

import AppFooter from "@xr3ngine/client-core/src/socialmedia/components/Footer";
import FeedForm from "@xr3ngine/client-core/src/socialmedia/components/FeedForm";
import AppHeader from "@xr3ngine/client-core/src/socialmedia/components/Header";

// @ts-ignore
import styles from './index.module.scss';

export default function NewFeedPage() {
   return <div className={styles.viewport}>
      <AppHeader logo="/assets/logoBlack.png"/>
      <FeedForm />
      <AppFooter />
    </div>;
}
