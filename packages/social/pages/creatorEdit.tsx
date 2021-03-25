
import React from "react";
import CreatorForm from "@xr3ngine/client-core/components/social/CreatorForm";
import AppFooter from "@xr3ngine/client-core/components/social/Footer";

import styles from './index.module.scss';

export default function User() {
  return (<>
    <div className={styles.viewport}>
      <CreatorForm />      
      <AppFooter />
    </div>
  </>
  );
}
