import React from 'react'
import styles from './Party.module.scss'
import Large from './Large.svg'
import Big from './Largee.svg'
import Blockparty from './BLOCKPARTY.svg'

const JoinParty = () => {
  return (
    <div>
      <section className={styles.joinparty}>
        <div className={styles.blockparty}>
          <img className={styles.block} src={Blockparty} alt="blockparty"></img>
          <img className={styles.large} src={Large} alt="large"></img>
          <img src={Big} alt="big"></img>
        </div>
      </section>
    </div>
  )
}

export default JoinParty
