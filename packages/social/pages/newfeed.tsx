
import React from "react";

import AppFooter from "@xr3ngine/client-core/src/components/social/Footer";
import FeedForm from "@xr3ngine/client-core/src/components/social/FeedForm";
import AppHeader from "@xr3ngine/client-core/src/components/social/Header";

import styles from './index.module.scss';

export default function NewFeedPage() {
   return <div className={styles.viewport}>
      <AppHeader logo="/assets/logoBlack.png"/>
      <FeedForm />
      <AppFooter />
    </div>;
}
