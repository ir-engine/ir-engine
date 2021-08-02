import React from 'react'
import styles from './Edit.module.scss'
import backarrow from './Backarrow.svg'
import Group from './Group.svg'
import Avatarr from './Avatarr.svg'
import Groupguys from './Groupguys.svg'
import Microphone from './Microphone.svg'
import Groupp from './Groupp.svg'
import Glasss from './Glasss.svg'
import Widgget from './Widgget.svg'

const ProfileEdit = () => {
  return (
    <div className={styles.editgroup}>
      <section>
        <div className={styles.groupicon}>
          <img src={backarrow} alt="backarrow"></img>
          <img src={Group} alt="group"></img>
        </div>
      </section>
      <section className={styles.profileusers}>
        <div>
          <img className={styles.avatar} src={Avatarr} alt="avatarr"></img>
          <img className={styles.btnmicrpohone} src={Microphone} alt="Microphone"></img>
        </div>

        <div>
          <img src={Groupguys} alt="groupguys"></img>
        </div>

        <div>
          <input className={styles.btninput} placeholder="Where would you like to go?" />
          <img className={styles.iconsearch} src={Groupp} alt="groupp"></img>
        </div>

        <div className={styles.map}>
          <img src={Glasss} alt="glasss"></img>
          <img className={styles.widget} src={Widgget} alt="widgget"></img>
        </div>
      </section>
    </div>
  )
}

export default ProfileEdit
