import React from 'react'
import styles from './PopupLogin.module.scss'
import { useTranslation } from 'react-i18next'

export const PopupLogin = (props): any => {
  const { t } = useTranslation()
  return props.trigger ? (
    <div className={styles.popup}>
      {props.children}
      <div className={styles.popup_inner}>
        <button type="button" className={styles.close_btn} onClick={() => props.setTrigger(false)}>
          {t('social:cancel')}
        </button>
      </div>
    </div>
  ) : (
    ''
  )
}

export default PopupLogin
