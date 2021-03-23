
import React from "react";

import AppFooter from "@xr3ngine/client-core/components/social/Footer";
import NotificationList from "@xr3ngine/client-core/components/social/NotificationList";
import AppHeader from "@xr3ngine/client-core/components/social/Header";

import styles from './index.module.scss';

export default function NotificationsPage() {
   return <div className={styles.viewport}>
      <AppHeader logo="/assets/logoBlack.png"/>
      <NotificationList />
      <AppFooter />
    </div>;
}
