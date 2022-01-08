import { useState } from '@hookstate/core'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { accessUserState } from '../../../user/services/UserService'
import Toast from './Toast'
import styles from './toast.module.scss'

const UserToast = () => {
  const toastMessages = useState(accessUserState().toastMessages).value
  const { t } = useTranslation()
  const msgs = toastMessages
    ? Array.from(toastMessages).map((m) => {
        if (m.userAdded)
          return (
            <span>
              <span className={styles.userAdded}>{m.user.name}</span> {t('common:toast.joined')}
            </span>
          )
        else if (m.userRemoved)
          return (
            <span>
              <span className={styles.userRemoved}>{m.user.name}</span> {t('common:toast.left')}
            </span>
          )
      })
    : []

  return <Toast messages={msgs} customClass={styles.userToastContainer} />
}

export default UserToast
