
import React from "react";

import AppFooter from "@xr3ngine/client-core/src/socialmedia/components/Footer";
import NotificationList from "@xr3ngine/client-core/src/socialmedia/components/NotificationList";
import AppHeader from "@xr3ngine/client-core/src/socialmedia/components/Header";

// @ts-ignore
import styles from './index.module.scss';

export default function NotificationsPage() {
   return <div className={styles.viewport}>
      <AppHeader logo="/assets/logoBlack.png"/>
      <NotificationList />
      <AppFooter />
    </div>;
}
