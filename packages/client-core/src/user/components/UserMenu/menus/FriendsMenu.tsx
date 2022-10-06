import { useHookstate } from '@hookstate/core'
import { cloneDeep } from 'lodash'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { UserInterface } from '@xrengine/common/src/interfaces/User'
import { WorldState } from '@xrengine/engine/src/networking/interfaces/WorldState'
import { getState } from '@xrengine/hyperflux'

import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import HowToRegIcon from '@mui/icons-material/HowToReg'
import MessageIcon from '@mui/icons-material/Message'
import { Typography } from '@mui/material'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'

import { NotificationService } from '../../../../common/services/NotificationService'
import { FriendService, useFriendState } from '../../../../social/services/FriendService'
import { useAuthState } from '../../../services/AuthService'
import { NetworkUserService, useNetworkUserState } from '../../../services/NetworkUserService'
import styles from '../index.module.scss'
import { getAvatarURLForUser, Views } from '../util'

interface Props {
  changeActiveMenu: Function
  defaultSelectedTab?: string
}

const FriendsMenu = ({ changeActiveMenu, defaultSelectedTab }: Props): JSX.Element => {
  const { t } = useTranslation()
  const [selectedTab, setSelectedTab] = React.useState(defaultSelectedTab ? defaultSelectedTab : 'friends')

  const friendState = useFriendState()
  const userState = useNetworkUserState()
  const selfUser = useAuthState().user
  const userId = selfUser.id.value
  const userAvatarDetails = useHookstate(getState(WorldState).userAvatarDetails)

  useEffect(() => {
    FriendService.getUserRelationship(userId)
    NetworkUserService.getLayerUsers(true)
  }, [])

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue)
  }

  const handleProfile = (user: UserInterface) => {
    changeActiveMenu(Views.AvatarContext, {
      user,
      onBack: () => changeActiveMenu(Views.Friends, { defaultSelectedTab: selectedTab })
    })
  }

  const displayList: Array<UserInterface> = []

  if (selectedTab === 'friends') {
    displayList.push(...friendState.relationships.pending.value)
    displayList.push(...friendState.relationships.friend.value)
  } else if (selectedTab === 'blocked') {
    displayList.push(...friendState.relationships.blocking.value)
  } else if (selectedTab === 'find') {
    const nearbyUsers = userState.layerUsers.value.filter(
      (layerUser) =>
        layerUser.id !== userId &&
        !friendState.relationships.friend.value.find((item) => item.id === layerUser.id) &&
        !friendState.relationships.pending.value.find((item) => item.id === layerUser.id) &&
        !friendState.relationships.blocked.value.find((item) => item.id === layerUser.id) &&
        !friendState.relationships.blocking.value.find((item) => item.id === layerUser.id)
    )
    displayList.push(...cloneDeep(nearbyUsers))

    displayList.forEach((layerUser) => {
      if (friendState.relationships.requested.value.find((item) => item.id === layerUser.id)) {
        layerUser.relationType = 'requested'
      }
    })
  }

  return (
    <div className={styles.menuPanel}>
      <div className={styles.friendsPanel}>
        <Tabs className={styles.tabsPanel} value={selectedTab} onChange={handleTabChange} variant="fullWidth">
          <Tab value="find" label={t('user:friends.find')} />
          <Tab value="friends" label={t('user:friends.friends')} />
          <Tab value="blocked" label={t('user:friends.blocked')} />
        </Tabs>

        <div className={styles.friendsList}>
          {displayList.map((value) => (
            <div key={value.id} className={styles.friendItem}>
              <Avatar alt={value.name} src={getAvatarURLForUser(userAvatarDetails, value.id)} />

              <span className={styles.friendName}>{value.name}</span>

              {value.relationType === 'friend' && (
                <IconButton
                  className={styles.filledBtn}
                  title={t('user:friends.message')}
                  onClick={() => NotificationService.dispatchNotify('Chat Pressed', { variant: 'info' })}
                >
                  <MessageIcon />
                </IconButton>
              )}

              {value.relationType === 'pending' && (
                <>
                  <Chip className={styles.chip} label={t('user:friends.pending')} size="small" variant="outlined" />

                  <IconButton
                    className={styles.filledBtn}
                    title={t('user:friends.accept')}
                    onClick={() => FriendService.acceptFriend(userId, value.id)}
                  >
                    <CheckIcon />
                  </IconButton>

                  <IconButton
                    className={styles.filledBtn}
                    title={t('user:friends.decline')}
                    onClick={() => FriendService.declineFriend(userId, value.id)}
                  >
                    <CloseIcon />
                  </IconButton>
                </>
              )}

              {value.relationType === 'requested' && (
                <Chip className={styles.chip} label={t('user:friends.requested')} size="small" variant="outlined" />
              )}

              {value.relationType === 'blocking' && (
                <IconButton
                  className={styles.filledBtn}
                  title={t('user:friends.unblock')}
                  onClick={() => FriendService.unblockUser(userId, value.id)}
                >
                  <HowToRegIcon />
                </IconButton>
              )}

              <IconButton
                className={styles.filledBtn}
                title={t('user:friends.profile')}
                onClick={() => handleProfile(value)}
              >
                <AccountCircleIcon />
              </IconButton>
            </div>
          ))}
          {displayList.length === 0 && (
            <Typography className={styles.noUsers} variant="body2">
              {t('user:friends.noUsers')}
            </Typography>
          )}
        </div>
      </div>
    </div>
  )
}

export default FriendsMenu
