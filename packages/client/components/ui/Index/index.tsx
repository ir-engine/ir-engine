import React from 'react';
import styles from './Index.module.scss';
import { connect } from 'react-redux';

const Index = (): any => (
  <div className="container">
    <div className={styles.box} onClick={() => (window.location.href = '/videos')}>
      360 Video Gallery
    </div>
    <div className={styles.box} onClick={() => (window.location.href = '/space')}>
      XR Space
    </div>
  </div>
);

export default connect()(Index);
