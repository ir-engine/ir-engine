
import React from "react";
import UserEdit from "@xr3ngine/client-core/components/social/User";
import AppFooter from "@xr3ngine/client-core/components/social/Footer";

import styles from './index.module.scss';

export default function User() {
  return (<>
    <div className={styles.viewport}>
      <UserEdit />      
      <AppFooter user={{username:'username'}} />
    </div>
  </>
  );
}
