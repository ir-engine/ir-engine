/**
 * @author Gleb Ordinsky <glebordinsky@gmail.com>
 */
import React from 'react';
// @ts-ignore
import styles from './Preloader.module.scss';

const Preloader = () => {
    return (
        <div className={styles.ldsRing}><div /><div /><div /><div /></div>
    );
};

export default Preloader;