import { createState } from '@speigg/hookstate'
import React from 'react'
import { useTranslation } from 'react-i18next'
import matches from 'ts-matches'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { NetworkWorldAction } from '@xrengine/engine/src/networking/functions/NetworkWorldAction'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { useXRUIState } from '@xrengine/engine/src/xrui/functions/useXRUIState'
import { addActionReceptor } from '@xrengine/hyperflux'

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
  user: String
}
const CharacterDetailView = () => {
  const { t } = useTranslation()
  addActionReceptor(Engine.currentWorld.store, userTypingActionReceptor)
  const detailState = useXRUIState() as CharacterDetailState
  const userState = useUserState()
  const [userTypingDetail, setUserTypingDetail] = React.useState<TypingDetail>()
  const user = userState.layerUsers.find((user) => user.id.value === detailState.id.value)

  function userTypingActionReceptor(action) {
    const world = Engine.currentWorld
    matches(action).when(NetworkWorldAction.userTyping.matches, ({ $from, typingDetail }) => {
      const client = world.clients.get($from)
      world.clients.set($from, { ...client, typingDetail })
      setUserTypingDetail(typingDetail)
    })
  }

  return user ? (
    <div style={styles.avatarName as {}}>
      {user.name.value}
      {userTypingDetail && userTypingDetail.typing && user.id.value == userTypingDetail.user && (
        <h6 style={{ margin: 0, padding: 0 }}>{t('common:typing')}</h6>
      )}
    </div>
  ) : (
    <div></div>
  )
}
