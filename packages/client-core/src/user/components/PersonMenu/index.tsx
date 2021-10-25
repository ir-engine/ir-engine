import React, { useEffect, useState } from 'react'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import styles from './PersonMenu.module.scss'
import { useTranslation } from 'react-i18next'
import { getAvatarURLForUser } from '../userMenu/util'
import { User } from '@xrengine/common/src/interfaces/User'
interface Props {
  user: User
}

const PersonMenu = (props: Props): any => {
  const { user } = props
  const { t } = useTranslation()

  return (
    <div className={styles.personPanel}>
      <img className={styles.personProfile} src={getAvatarURLForUser(user?.id)} />
      <section className={styles.controlContainer}>
        <Button className={styles.action}> {t('user:personMenu.sendMessage')}</Button>
        <Button className={styles.action}>{t('user:personMenu.addAsFriend')}</Button>
        <Button className={styles.action}>{t('user:personMenu.trade')}</Button>
        <Button className={styles.action}>{t('user:personMenu.pay')}</Button>
        <Button className={styles.action}>{t('user:personMenu.mute')}</Button>
        <Button className={`${styles.action} ${styles.block}`}>{t('user:personMenu.block')}</Button>
      </section>
    </div>
  )
}

export default PersonMenu
