import React from 'react'
import styles from './Popup.module.scss'

export const PopupLogin = (props): any => {
   return (props.trigger) ? (
      <div className={styles.popup}> 
       
           
            {props.children}
       
      </div>
   ): "";
}

export default PopupLogin