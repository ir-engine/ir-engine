import React from 'react'
import styles from './User.module.scss'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import ArrowUpwardTwoToneIcon from '@material-ui/icons/ArrowUpwardTwoTone'
import SendRoundedIcon from '@material-ui/icons/SendRounded'
import MicNoneTwoToneIcon from '@material-ui/icons/MicNoneTwoTone'
import CloseIcon from '@material-ui/icons/Close'

const Chat = () => {
  return (
    <div>
      <section className={styles.message}>
        <span className={styles.icondown}>
          <KeyboardArrowDownIcon fontSize="large" />
        </span>
        <span className={styles.icontop}>
          <ArrowUpwardTwoToneIcon />
        </span>
      </section>

      <section>
        <div className={styles.chatmsg}>
          <p className={styles.username}>User Name:short msg</p>
          <br />
          <p className={styles.userlong}>User Name:This is what a much longer message looks like in the world chat</p>
        </div>
      </section>

      <section className={styles.messaging}>
        <div className={styles.user}>
          <input className={styles.input} type="text" placeholder="say something..." />
          <span className={styles.send}>
            <SendRoundedIcon fontSize="small" />
          </span>
        </div>
      </section>

      <section className={styles.bottomicon}>
        <span className={styles.closed}>
          <CloseIcon front-size="large" />
        </span>
        <span className={styles.mic}>
          <MicNoneTwoToneIcon />
        </span>
      </section>
    </div>
  )
}

export default Chat
