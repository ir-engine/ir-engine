import React from 'react';
import styles from './LoadingBar.module.scss';

interface Props {
  loadPercent: number;
}
const LoadingBar = ({ loadPercent }: Props): any => {
  return (
    <div className={styles.LoadingBar}>
      <div className={styles['loading-bar-outline']} />
      <div
        className={styles['progress-bar']}
        style={{
          width: `${loadPercent}%`
        }}
      />
    </div>
  );
};
export default LoadingBar;
