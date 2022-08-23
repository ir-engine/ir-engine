import { useHookstate } from '@hookstate/core'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { UserInterface } from '@xrengine/common/src/interfaces/User'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { WorldState } from '@xrengine/engine/src/networking/interfaces/WorldState'
import { getState } from '@xrengine/hyperflux'

import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import MessageIcon from '@mui/icons-material/Message'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'

import { FriendService, useFriendState } from '../../../../social/services/FriendService'
import { useAuthState } from '../../../services/AuthService'
import styles from '../index.module.scss'
import { getAvatarURLForUser } from '../util'

const FriendsMenu = (): JSX.Element => {
  const { t } = useTranslation()
  const [selectedTab, setSelectedTab] = React.useState('friends')

  const friendState = useFriendState()
  const selfUser = useAuthState().user
  const userId = selfUser.id.value
  const userAvatarDetails = useHookstate(getState(WorldState).userAvatarDetails)

  FriendService.useAPIListeners()

  useEffect(() => {
    FriendService.getUserRelationship(userId)
  }, [])

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue)
  }

  const displayList: Array<UserInterface> = [
    {
      id: 'aea8c180-1f85-11ed-84fc-c98efb98debe' as UserId,
      name: 'Hanzla',
      isGuest: false,
      apiKey: {
        id: 'asd',
        token: 'asdasd',
        userId: 'aea8c180-1f85-11ed-84fc-c98efb98debe' as UserId
      }
    },
    {
      id: 'a228c180-1f85-11ed-84fc-c98efb98debe' as UserId,
      name: 'Guest 1',
      isGuest: false,
      apiKey: {
        id: 'as33d',
        token: 'asdasd',
        userId: 'aea8c180-1f85-11ed-84fc-c98efb98debe' as UserId
      }
    },
    {
      id: 'a338c180-1f85-11ed-84fc-c98efb98debe' as UserId,
      name: 'Guest 4',
      isGuest: false,
      apiKey: {
        id: '223asd',
        token: 'asdasd',
        userId: 'aea8c180-1f85-11ed-84fc-c98efb98debe' as UserId
      }
    }
  ]

  return (
    <div className={styles.menuPanel}>
      <div className={styles.friendsPanel}>
        <Tabs className={styles.tabsPanel} value={selectedTab} onChange={handleTabChange} variant="fullWidth">
          <Tab value="find" label="Find" />
          <Tab value="friends" label="Friends" />
          <Tab value="blocked" label="Blocked" />
        </Tabs>

        <div className={styles.friendsList}>
          {friendState.relationships.friend.value.map((value, index) => (
            <div className={styles.friendItem}>
              <Avatar alt={value.name} src={getAvatarURLForUser(userAvatarDetails, value.id)} />

              <span className={styles.friendName}>{value.name}</span>

              <IconButton className={styles.filledBtn}>
                <MessageIcon />
              </IconButton>

              <IconButton className={styles.filledBtn}>
                <AccountCircleIcon />
              </IconButton>
              {/*               
              <Button className={styles.filledBtn}>
                Chat
              </Button>
              <Button className={styles.filledBtn}>
                Profile
              </Button> */}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FriendsMenu
