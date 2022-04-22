import { createState } from '@speigg/hookstate'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import matches from 'ts-matches'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { NetworkWorldAction } from '@xrengine/engine/src/networking/functions/NetworkWorldAction'
import { UsersTypingState } from '@xrengine/engine/src/networking/interfaces/WorldState'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { useXRUIState } from '@xrengine/engine/src/xrui/functions/useXRUIState'
import { addActionReceptor, getState } from '@xrengine/hyperflux'

import { useUserState } from '../../user/services/UserService'

const styles = {
  avatarName: {
    fontSize: '60px',
    backgroundColor: '#000000dd',
    color: 'white',
    fontFamily: "'Roboto', sans-serif",
    border: '10px solid white',
    borderRadius: '50px',
    padding: '20px',
    margin: '60px',
    boxShadow: '#fff2 0 0 30px',
    width: '400px',
    textAlign: 'center'
  }
}

export function createAvatarDetailView(id: string) {
  return createXRUI(CharacterDetailView, createAvatarDetailState(id))
}

function createAvatarDetailState(id: string) {
  return createState({
    id
  })
}

type CharacterDetailState = ReturnType<typeof createAvatarDetailState>
interface TypingDetail {
  typing: Boolean
  userId: string
}
const CharacterDetailView = () => {
  const { t } = useTranslation()

  const detailState = useXRUIState() as CharacterDetailState
  const userState = useUserState()
  const [userTypingDetail, setUserTypingDetail] = React.useState<TypingDetail>()
  const usersTyping = React.useState(getState(Engine.currentWorld.store, UsersTypingState))
  const user = userState.layerUsers.find((user) => user.id.value === detailState.id.value)

  useEffect(() => {
    addActionReceptor(Engine.currentWorld.store, userTypingActionReceptor)
  }, [])

  function userTypingActionReceptor(action) {
    const world = Engine.currentWorld
    matches(action).when(NetworkWorldAction.userTyping.matches, ({ $from, typing }) => {
      const client = world.clients.get($from)
      world.clients.set($from, JSON.parse(JSON.stringify({ ...client, typing })))
      setUserTypingDetail({
        typing: typing,
        userId: $from
      })
    })
  }

  return user ? (
    <div style={styles.avatarName as {}}>
      {user.name.value}
      {userTypingDetail && userTypingDetail.typing && userTypingDetail.userId == user.id.value && (
        <h6 style={{ margin: 0, padding: 0 }}>{t('common:typing')}</h6>
      )}
    </div>
  ) : (
    <div></div>
  )
}
