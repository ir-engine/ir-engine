import React, { useEffect, useState } from 'react'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import styles from './PersonMenu.module.scss'
import { useTranslation } from 'react-i18next'
import { getAvatarURLForUser } from '../../../user/components/userMenu/util'
import { User } from '@xrengine/common/src/interfaces/User'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { useXRUIState } from '@xrengine/engine/src/xrui/functions/useXRUIState'
import { createState } from '@hookstate/core'
import { useUserState } from '../../../user/services/UserService'
export function createAvatarContextMenuView(id: string) {
  return createXRUI(AvatarContextMenu, createAvatarContextMenuState(id))
}

function createAvatarContextMenuState(id: string) {
  return createState({
    id
  })
}

type CharacterContextMenuState = ReturnType<typeof createAvatarContextMenuState>

const AvatarContextMenu = () => {
  const detailState = useXRUIState() as CharacterContextMenuState

  const userState = useUserState()
  const user = userState.layerUsers.find((user) => user.id.value === detailState.id.value)

  const { t } = useTranslation()

  return user ? (
    <div className={styles.personPanel}>
      <img className={styles.personProfile} src={getAvatarURLForUser(user?.id?.value)} />
      <section className={styles.controlContainer}>
        <Button
          className={styles.action}
          onClick={() => {
            console.log('Person Menu')
          }}
        >
          {' '}
          {t('user:personMenu.sendMessage')}
        </Button>
        <Button
          className={styles.action}
          onClick={() => {
            console.log('Add as a friend')
          }}
        >
          {t('user:personMenu.addAsFriend')}
        </Button>
        <Button
          className={styles.action}
          onClick={() => {
            console.log('Trade')
          }}
        >
          {t('user:personMenu.trade')}
        </Button>
        <Button
          className={styles.action}
          onClick={() => {
            console.log('Pay')
          }}
        >
          {t('user:personMenu.pay')}
        </Button>
        <Button
          className={styles.action}
          onClick={() => {
            console.log('Mute')
          }}
        >
          {t('user:personMenu.mute')}
        </Button>
        <Button
          className={`${styles.action} ${styles.block}`}
          onClick={() => {
            console.log('Block')
          }}
        >
          {t('user:personMenu.block')}
        </Button>
      </section>
    </div>
  ) : (
    <div></div>
  )
}
