/**
 * @author Gleb Ordinsky <glebordinsky@gmail.com>
 */
import React from 'react'
import styles from './Preloader.module.scss'
interface Props {
  text?: any
}
const Preloader = ({ text }: Props) => {
  return (
    <div className={styles.ldsRing}>
      <div />
      <div />
      <div />
      <div />
      <span>{text}</span>
    </div>
  )
}

export default Preloader
