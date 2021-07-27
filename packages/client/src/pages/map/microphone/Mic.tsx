import React from 'react'
import styles from './Sound.module.scss'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import ArrowUpwardTwoToneIcon from '@material-ui/icons/ArrowUpwardTwoTone'
import TextsmsTwoToneIcon from '@material-ui/icons/TextsmsTwoTone'
import MicNoneTwoToneIcon from '@material-ui/icons/MicNoneTwoTone'

const MicIcon = () => {
  return (
    <div>
      <section className={styles.top}>
        <span className={styles.icondown}>
          <KeyboardArrowDownIcon fontSize="large" />
        </span>
        <span className={styles.icontop}>
          <ArrowUpwardTwoToneIcon />
        </span>
        <span className={styles.iconmessage}>
          <TextsmsTwoToneIcon />
        </span>
        <span className={styles.iconmic}>
          <MicNoneTwoToneIcon />
        </span>
      </section>
    </div>
  )
}
export default MicIcon
