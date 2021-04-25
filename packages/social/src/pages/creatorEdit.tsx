
import React from "react";
import CreatorForm from "@xr3ngine/client-core/src/socialmedia/components/CreatorForm";
import AppFooter from "@xr3ngine/client-core/src/socialmedia/components/Footer";

// @ts-ignore
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
