import React from 'react'
import Button from '@mui/material/Button'
import { useTranslation } from 'react-i18next'
import { getAvatarURLForUser } from '../../user/components/UserMenu/util'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { createState } from '@hookstate/core'
import { useUserState, UserService } from '../../user/services/UserService'
import { useAuthState } from '../../user/services/AuthService'
import { useXRUIState } from '@xrengine/engine/src/xrui/functions/useXRUIState'
import { accessEngineState } from '@xrengine/engine/src/ecs/classes/EngineService'

const styles = {
  root: {
    width: '500px',
    paddingTop: '75px',
    fontFamily: "'Roboto', sans-serif"
  },
  ownerImage: {
    position: 'absolute',
    width: '150px',
    height: '150px',
    top: '75px',
    left: '0',
    right: '0',
    margin: 'auto',
    borderRadius: '75px',
    filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))',
    background: 'linear-gradient(180deg, rgba(137, 137, 242, 0.9) 0%, rgba(92, 92, 92, 0.9) 100%)',
    zIndex: '1000'
  },
  buttonContainer: {
    background: 'linear-gradient(180deg, rgba(137, 137, 242, 0.5) 0%, rgba(92, 92, 92, 0.5) 100%)',
    backdropFilter: 'blur(41.8478px)',
    borderRadius: '8.36957px',
    boxShadow: '16px 16px 32px 0px #11111159',
    color: 'black',
    filter: 'drop-shadow(0px 3.34783px 3.34783px rgba(0, 0, 0, 0.25))',
    padding: '26px 0px 5px 0px',
    marginTop: '75px'
  },
  buttonSection: {
    margin: '70px 40px 20px',
    justifyContent: 'space-between'
  },
  button: {
    background: 'linear-gradient(180deg, rgba(137, 137, 242, 0.5) 0%, rgba(92, 92, 92, 0.5) 100%)',
    backdropFilter: 'blur(50px)',
    borderRadius: '8px',
    width: '100%',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: '35px',
    lineHeight: '14px',
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    color: 'white',
    margin: 'auto auto 20px',
    borderStyle: 'none',
    padding: '30px 10px',
    justifyContent: 'center'
  },
  buttonRed: {
    background: 'linear-gradient(180deg, rgba(137, 137, 242, 0.5) 0%, rgba(92, 92, 92, 0.5) 100%)',
    backdropFilter: 'blur(50px)',
    borderRadius: '8px',
    width: '100%',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: '35px',
    lineHeight: '14px',
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    color: '#FF0000',
    margin: 'auto auto 20px',
    borderStyle: 'none',
    padding: '30px 10px',
    justifyContent: 'center'
  }
}

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

  const engineState = accessEngineState()
  const userState = useUserState()
  const authState = useAuthState()
  const user = userState.layerUsers.find((user) => user.id.value === detailState.id.value)
  const { t } = useTranslation()

  const blockUser = () => {
    if (authState.user?.id?.value !== null && user) {
      const selfId = authState.user.id?.value ?? ''
      const blockUserId = user.id?.value ?? ''
      UserService.blockUser(selfId, blockUserId)
    }
  }

  const addAsFriend = () => {
    if (authState.user?.id?.value !== null && user) {
      const selfId = authState.user.id?.value ?? ''
      const blockUserId = user.id?.value ?? ''
      UserService.requestFriend(selfId, blockUserId)
    }
  }

  return user && engineState.avatarTappedId?.value === user.id.value ? (
    <div style={styles.root}>
      <img style={styles.ownerImage as {}} src={getAvatarURLForUser(user?.id?.value)} />
      <div style={styles.buttonContainer}>
        <section style={styles.buttonSection}>
          <Button
            style={styles.button as {}}
            onClick={() => {
              console.log('Invite to Party')
            }}
          >
            {t('user:personMenu.inviteToParty')}
          </Button>
          <Button style={styles.button as {}} onClick={addAsFriend}>
            {t('user:personMenu.addAsFriend')}
          </Button>
          <Button
            style={styles.button as {}}
            onClick={() => {
              console.log('Trade')
            }}
          >
            {t('user:personMenu.trade')}
          </Button>
          <Button
            style={styles.button as {}}
            onClick={() => {
              console.log('Pay')
            }}
          >
            {t('user:personMenu.pay')}
          </Button>
          <Button
            style={styles.button as {}}
            onClick={() => {
              console.log('Mute')
            }}
          >
            {t('user:personMenu.mute')}
          </Button>
          <Button style={styles.buttonRed as {}} onClick={blockUser}>
            {t('user:personMenu.block')}
          </Button>
        </section>
      </div>
    </div>
  ) : (
    <div></div>
  )
}
