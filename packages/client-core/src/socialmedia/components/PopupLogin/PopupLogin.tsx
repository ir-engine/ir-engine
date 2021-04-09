import React from 'react';
import styles from './PopupLogin.module.scss';

export const PopupLogin = (props): any => {
   return (props.trigger) ? (
      <div className={styles.popup}> 
            {props.children}
            <div className={styles.popup_inner}>
            <button type="button" className={styles.close_btn} onClick={() => props.setTrigger(false)}>Cancel</button>
           </div>
      </div>
   ): "";
};

export default PopupLogin;
