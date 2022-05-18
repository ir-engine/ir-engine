import React, { useEffect } from 'react'

//@ts-ignore
import styles from './CreatorFormPopup.module.scss'
import CreatorForm from '../../CreatorForm'
import { isIOS } from '@xrengine/client-core/src/util/platformCheck'

export const CreatorFormPopup = () => {
  const platformClass = isIOS ? styles.isIos : ''

  return (
    <div className={styles.creatorFormPopup + ' ' + platformClass}>
      <CreatorForm />
    </div>
  )
}

export default CreatorFormPopup
