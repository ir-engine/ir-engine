import React from 'react';
import styles from './style.module.scss';

const Loader = (): any => {
  return (
  <div className={styles["wrapper"]}>
    <div className={styles["box"]}>
      <div className={styles["cube"]}></div>
      <div className={styles["cube"]}></div>
      <div className={styles["cube"]}></div>
      <div className={styles["cube"]}></div>
    </div>
  </div>
  );
};

export default Loader;
