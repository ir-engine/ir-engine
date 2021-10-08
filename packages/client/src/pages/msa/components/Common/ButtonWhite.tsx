import React from 'react'
import styles from './Common.module.scss'

const ButtonWhite = (props: any): any => {
  return (
    <div className={styles.cardBackgroundWhite} onClick={props.onButtonClick}>
      {props.title}
    </div>
  )
}
export default ButtonWhite
