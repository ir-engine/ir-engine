import React, { useEffect, useState } from 'react'
import Button from '@material-ui/core/Button'
import { useTranslation } from 'react-i18next'
import { getAvatarURLForUser } from '../../user/components/userMenu/util'
import { User } from '@xrengine/common/src/interfaces/User'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { createState } from '@hookstate/core'
import { useUserState } from '../../user/services/UserService'
import { useXRUIState } from '@xrengine/engine/src/xrui/functions/useXRUIState'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'

export function createAvatarContextMenuView(id: string) {
  return createXRUI(AvatarContextMenu, createAvatarContextMenuState(id))
}

function createAvatarContextMenuState(id: string) {
  return createState({
    id
  })
}

type AvatarContextMenuState = ReturnType<typeof createAvatarContextMenuState>

const AvatarContextMenu = () => {
  const detailState = useXRUIState() as AvatarContextMenuState

  const userState = useUserState()
  const user = userState.layerUsers.find((user) => user.id.value === detailState.id.value)

  const { t } = useTranslation()

  return user && userState.selectedLayerUser.value === user.id.value ? (
    <div style={{ width: '400px', paddingTop: '75px' }}>
      <img
        style={{
          position: 'absolute',
          width: '150px',
          height: '150px',
          top: '75px',
          left: '0',
          right: '0',
          margin: 'auto',
          borderRadius: '75px',
          filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))',
          background: 'linear-gradient(180deg, rgba(137, 137, 242, 0.8) 0%, rgba(92, 92, 92, 0.8) 100%)',
          zIndex: '1000'
        }}
        src={getAvatarURLForUser(user?.id?.value)}
      />
      <div
        style={{
          background: 'linear-gradient(180deg, rgba(137, 137, 242, 0.8) 0%, rgba(92, 92, 92, 0.8) 100%)',
          backdropFilter: 'blur(80.8478px)',
          borderRadius: '8.36957px',
          boxShadow: '16px 16px 32px 0px #11111159',
          color: 'black',
          filter: 'drop-shadow(0px 3.34783px 3.34783px rgba(0, 0, 0, 0.25))',
          padding: '26px 0px 5px 0px',
          marginTop: '75px'
        }}
      >
        <section style={{ justifyContent: 'space-between', margin: '70px 15px 15px 15px' }}>
          <Button
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              width: '100%',
              fontFamily: 'Roboto',
              fontStyle: 'normal',
              fontWeight: '500',
              fontSize: '35px',
              lineHeight: '14px',
              display: 'flex',
              alignItems: 'center',
              textAlign: 'center',
              color: '#FFFFFF',
              margin: '10px 0px',
              borderStyle: 'none',
              padding: '20px 10px',
              justifyContent: 'center'
            }}
            onClick={() => {
              console.log('Person Menu')
            }}
          >
            {t('user:personMenu.sendMessage')}
          </Button>
          <Button
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              width: '100%',
              fontFamily: 'Roboto',
              fontStyle: 'normal',
              fontWeight: '500',
              fontSize: '35px',
              lineHeight: '14px',
              display: 'flex',
              alignItems: 'center',
              textAlign: 'center',
              color: '#FFFFFF',
              margin: '10px 0px',
              borderStyle: 'none',
              padding: '20px 10px',
              justifyContent: 'center'
            }}
            onClick={() => {
              console.log('Add as a friend')
            }}
          >
            {t('user:personMenu.addAsFriend')}
          </Button>
          <Button
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              width: '100%',
              fontFamily: 'Roboto',
              fontStyle: 'normal',
              fontWeight: '500',
              fontSize: '35px',
              lineHeight: '14px',
              display: 'flex',
              alignItems: 'center',
              textAlign: 'center',
              color: '#FFFFFF',
              margin: '10px 0px',
              borderStyle: 'none',
              padding: '20px 10px',
              justifyContent: 'center'
            }}
            onClick={() => {
              console.log('Trade')
            }}
          >
            {t('user:personMenu.trade')}
          </Button>
          <Button
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              width: '100%',
              fontFamily: 'Roboto',
              fontStyle: 'normal',
              fontWeight: '500',
              fontSize: '35px',
              lineHeight: '14px',
              display: 'flex',
              alignItems: 'center',
              textAlign: 'center',
              color: '#FFFFFF',
              margin: '10px 0px',
              borderStyle: 'none',
              padding: '20px 10px',
              justifyContent: 'center'
            }}
            onClick={() => {
              console.log('Pay')
            }}
          >
            {t('user:personMenu.pay')}
          </Button>
          <Button
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              width: '100%',
              fontFamily: 'Roboto',
              fontStyle: 'normal',
              fontWeight: '500',
              fontSize: '35px',
              lineHeight: '14px',
              display: 'flex',
              alignItems: 'center',
              textAlign: 'center',
              color: '#FFFFFF',
              margin: '10px 0px',
              borderStyle: 'none',
              padding: '20px 10px',
              justifyContent: 'center'
            }}
            onClick={() => {
              console.log('Mute')
            }}
          >
            {t('user:personMenu.mute')}
          </Button>
          <Button
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              width: '100%',
              fontFamily: 'Roboto',
              fontStyle: 'normal',
              fontWeight: '500',
              fontSize: '35px',
              lineHeight: '14px',
              display: 'flex',
              alignItems: 'center',
              textAlign: 'center',
              color: '#FF0000',
              margin: '10px 20px 0px 0px',
              borderStyle: 'none',
              padding: '20px 10px',
              justifyContent: 'center'
            }}
            onClick={() => {
              console.log('Block')
            }}
          >
            {t('user:personMenu.block')}
          </Button>
        </section>
      </div>
    </div>
  ) : (
    <div></div>
  )
}
