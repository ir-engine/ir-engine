import React from 'react'
import styles from './Loader.module.scss'
import Block from './Block'

const Loading = () => {
  return (
    <div>
      <section className={styles.blockbg}>
        <div className={styles.block}>
          <Block />
          <h4 className={styles.title}>loading block party...</h4>
        </div>
      </section>
    </div>
  )
}

export default Loading
