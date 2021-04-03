
import React from "react";

import AppFooter from "@xr3ngine/client-core/src/components/social/Footer";
import NotificationList from "@xr3ngine/client-core/src/components/social/NotificationList";
import AppHeader from "@xr3ngine/client-core/src/components/social/Header";

import styles from './index.module.scss';

export default function NotificationsPage() {
   return <div className={styles.viewport}>
      <AppHeader logo="/assets/logoBlack.png"/>
      <NotificationList />
      <AppFooter />
    </div>;
}
