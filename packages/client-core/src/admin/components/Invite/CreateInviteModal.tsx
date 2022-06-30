import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SendInvite } from '@xrengine/common/src/interfaces/Invite'
import { Location } from '@xrengine/common/src/interfaces/Location'

import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Container from '@mui/material/Container'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'

import { NotificationService } from '../../../common/services/NotificationService'
import { emailRegex, InviteService, phoneRegex } from '../../../social/services/InviteService'
import DrawerView from '../../common/DrawerView'
import InputSelect, { InputMenuItem } from '../../common/InputSelect'
import InputText from '../../common/InputText'
import { AdminInstanceService, useAdminInstanceState } from '../../services/InstanceService'
import { AdminInviteService } from '../../services/InviteService'
import { AdminLocationService, useAdminLocationState } from '../../services/LocationService'
import { AdminSceneService, useAdminSceneState } from '../../services/SceneService'
import { AdminUserService, useUserState } from '../../services/UserService'
import styles from '../../styles/admin.module.scss'

interface Props {
  open: boolean
  onClose: () => void
}

const INVITE_TYPE_TAB_MAP = {
  0: 'new-user',
  1: 'location',
  2: 'instance',
  3: 'friend',
  4: 'group',
  5: 'party'
}

const CreateInviteModal = ({ open, onClose }: Props) => {
  const [inviteTypeTab, setInviteTypeTab] = useState(0)
  const [textValue, setTextValue] = useState('')
  const [makeAdmin, setMakeAdmin] = useState(false)
  const [oneTimeUse, setOneTimeUse] = useState(true)
  const [locationId, setLocationId] = useState('')
  const [instanceId, setInstanceId] = useState('')
  const [userInviteCode, setUserInviteCode] = useState('')
  const [spawnPointUUID, setSpawnPointUUID] = useState('')
  const [setSpawn, setSetSpawn] = useState(false)
  const [spawnTypeTab, setSpawnTypeTab] = useState(0)
  const { t } = useTranslation()
  const adminLocationState = useAdminLocationState()
  const adminInstanceState = useAdminInstanceState()
  const adminUserState = useUserState()
  const adminSceneState = useAdminSceneState()
  const adminLocations = adminLocationState.locations
  const adminInstances = adminInstanceState.instances
  const adminUsers = adminUserState.users
  const spawnPoints = adminSceneState.singleScene?.scene?.entities.value
    ? Object.entries(adminSceneState.singleScene.scene.entities.value).filter(([, value]) =>
        value.components.find((component) => component.name === 'spawn-point')
      )
    : []

  useEffect(() => {
    AdminLocationService.fetchAdminLocations()
    AdminInstanceService.fetchAdminInstances()
    AdminUserService.setSkipGuests(true)
    AdminUserService.fetchUsersAsAdmin()
  }, [])

  const handleChangeInviteTypeTab = (event: React.SyntheticEvent, newValue: number) => {
    setInviteTypeTab(newValue)
  }

  const handleTextChange = (event: React.SyntheticEvent) => {
    setTextValue((event.target as HTMLInputElement).value)
  }

  const locationMenu: InputMenuItem[] = adminLocations.map((el) => {
    return {
      value: `${el.id.value}`,
      label: `${el.name.value} (${el.sceneId.value})`
    }
  })

  const instanceMenu: InputMenuItem[] = adminInstances.map((el) => {
    return {
      value: `${el.id.value}`,
      label: `${el.id.value} (${el.location.name.value})`
    }
  })

  const userMenu: InputMenuItem[] = adminUsers.map((el) => {
    return {
      value: `${el.inviteCode.value}`,
      label: `${el.name.value} (${el.inviteCode.value})`
    }
  })

  const spawnPointMenu: InputMenuItem[] = spawnPoints.map(([id, value]) => {
    const transform = value.components.find((component) => component.name === 'transform')
    if (transform) {
      const position = transform.props.position
      return {
        value: `${id}`,
        label: `${id} (x: ${position.x}, y: ${position.y}, z: ${position.z})`
      }
    }
    return {
      value: `${id}`,
      label: `${id}`
    }
  })

  const handleChangeSpawnTypeTab = (event: React.SyntheticEvent, newValue: number) => {
    setSpawnTypeTab(newValue)
  }

  const handleLocationChange = (e) => {
    setLocationId(e.target.value)
    const location = adminLocations.find((location) => location.id.value === e.target.value)
    if (location && location.sceneId.value) {
      const sceneName = location.sceneId.value.split('/')
      AdminSceneService.fetchAdminScene(sceneName[0], sceneName[1])
    }
  }

  const handleInstanceChange = (e) => {
    setInstanceId(e.target.value)
    const instance = adminInstances.find((instance) => instance.id.value === e.target.value)
    if (instance) {
      const location = adminLocations.find((location) => location.id.value === instance.locationId.value)
      if (location) {
        const sceneName = location.sceneId.value.split('/')
        AdminSceneService.fetchAdminScene(sceneName[0], sceneName[1])
      }
    }
  }

  const handleUserChange = (e) => {
    setUserInviteCode(e.target.value)
  }

  const handleSpawnPointChange = (e) => {
    setSpawnPointUUID(e.target.value)
  }

  const submitInvites = async (event: React.SyntheticEvent) => {
    const targets = textValue.split(',')
    targets.map(async (target) => {
      try {
        const inviteType = INVITE_TYPE_TAB_MAP[inviteTypeTab]
        const isPhone = phoneRegex.test(target)
        const isEmail = emailRegex.test(target)
        const sendData = {
          inviteType: inviteType,
          token: target.length === 8 ? null : target,
          inviteCode: target.length === 8 ? target : null,
          identityProviderType: isEmail ? 'email' : isPhone ? 'sms' : null,
          targetObjectId: instanceId || locationId || null,
          makeAdmin: makeAdmin,
          deleteOnUse: oneTimeUse
        } as SendInvite
        if (setSpawn && spawnTypeTab === 0 && userInviteCode) {
          sendData.spawnType = 'inviteCode'
          sendData.spawnDetails = { inviteCode: userInviteCode }
        } else if (setSpawn && spawnTypeTab === 1 && spawnPointUUID) {
          sendData.spawnType = 'spawnPoint'
          sendData.spawnDetails = { spawnPoint: spawnPointUUID }
        }
        await InviteService.sendInvite(sendData)
        setInstanceId('')
        setLocationId('')
        setTextValue('')
        setMakeAdmin(false)
        setOneTimeUse(true)
        setUserInviteCode('')
        setSetSpawn(false)
        setSpawnPointUUID('')
        setSpawnTypeTab(0)
        setInviteTypeTab(0)
        return
      } catch (err) {
        NotificationService.dispatchNotify(err.message, { variant: 'error' })
      }
    })
    setTimeout(() => AdminInviteService.fetchAdminInvites(), 500)
    onClose()
  }

  const disableSendButton = (): boolean => {
    return (
      textValue.length === 0 ||
      (inviteTypeTab === 1 && locationId.length === 0) ||
      (inviteTypeTab === 2 && instanceId.length === 0)
    )
  }

  return (
    <DrawerView open={open} onClose={onClose}>
      <Container maxWidth="sm" className={styles.mt20}>
        <DialogTitle className={styles.textAlign}>{t('admin:components.invite.create')}</DialogTitle>
        <FormGroup>
          <Tabs
            value={inviteTypeTab}
            onChange={handleChangeInviteTypeTab}
            aria-label="Invite Type"
            classes={{ root: styles.tabRoot, indicator: styles.selected }}
          >
            <Tab
              className={inviteTypeTab === 0 ? styles.selectedTab : styles.unselectedTab}
              label={INVITE_TYPE_TAB_MAP[0].replace('-', ' ')}
              classes={{ root: styles.tabRoot }}
            />
            <Tab
              className={inviteTypeTab === 1 ? styles.selectedTab : styles.unselectedTab}
              label={INVITE_TYPE_TAB_MAP[1].replace('-', ' ')}
            />
            <Tab
              className={inviteTypeTab === 2 ? styles.selectedTab : styles.unselectedTab}
              label={INVITE_TYPE_TAB_MAP[2].replace('-', ' ')}
            />
          </Tabs>
          <div className={styles.inputContainer}>
            <InputText
              name="urlSelect"
              label={t('admin:components.invite.targetLabel')}
              placeholder={t('admin:components.invite.target')}
              value={textValue}
              onChange={handleTextChange}
            />
          </div>
          <FormControlLabel
            control={
              <Checkbox
                checked={oneTimeUse}
                onChange={() => {
                  setOneTimeUse(!oneTimeUse)
                }}
              />
            }
            label="One-time use"
          />
          {inviteTypeTab === 0 && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={makeAdmin}
                  onChange={() => {
                    setMakeAdmin(!makeAdmin)
                  }}
                />
              }
              label="Make user admin"
            />
          )}
          {inviteTypeTab === 1 && (
            <div>
              <InputSelect
                name="location"
                label={t('admin:components.invite.location')}
                value={locationId}
                menu={locationMenu}
                disabled={false}
                onChange={handleLocationChange}
              />
              {locationId && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={setSpawn}
                      onChange={() => {
                        setSetSpawn(!setSpawn)
                      }}
                    />
                  }
                  label="Spawn at position"
                />
              )}
              {setSpawn && (
                <Tabs
                  value={spawnTypeTab}
                  onChange={handleChangeSpawnTypeTab}
                  aria-label="Spawn position"
                  classes={{ root: styles.tabRoot, indicator: styles.selected }}
                >
                  <Tab
                    className={spawnTypeTab === 0 ? styles.selectedTab : styles.unselectedTab}
                    label="User position"
                    classes={{ root: styles.tabRoot }}
                  />
                  <Tab
                    className={spawnTypeTab === 1 ? styles.selectedTab : styles.unselectedTab}
                    label={'Spawn Point'}
                  />
                </Tabs>
              )}
              {setSpawn && spawnTypeTab === 0 && (
                <InputSelect
                  name="user"
                  label={t('admin:components.invite.user')}
                  value={userInviteCode}
                  menu={userMenu}
                  disabled={false}
                  onChange={handleUserChange}
                />
              )}
              {setSpawn && spawnTypeTab === 1 && (
                <InputSelect
                  name="spawnPoint"
                  label={t('admin:components.invite.spawnPoint')}
                  value={spawnPointUUID}
                  menu={spawnPointMenu}
                  disabled={false}
                  onChange={handleSpawnPointChange}
                />
              )}
            </div>
          )}
          {inviteTypeTab === 2 && (
            <div>
              <InputSelect
                name="instance"
                label={t('admin:components.invite.instance')}
                value={instanceId}
                menu={instanceMenu}
                disabled={false}
                onChange={handleInstanceChange}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={setSpawn}
                    onChange={() => {
                      setSetSpawn(!setSpawn)
                    }}
                  />
                }
                label="Spawn at position"
              />
              {setSpawn && (
                <Tabs
                  value={spawnTypeTab}
                  onChange={handleChangeSpawnTypeTab}
                  aria-label="Spawn position"
                  classes={{ root: styles.tabRoot, indicator: styles.selected }}
                >
                  <Tab
                    className={spawnTypeTab === 0 ? styles.selectedTab : styles.unselectedTab}
                    label="User position"
                    classes={{ root: styles.tabRoot }}
                  />
                  <Tab
                    className={spawnTypeTab === 1 ? styles.selectedTab : styles.unselectedTab}
                    label={'Spawn Point'}
                  />
                </Tabs>
              )}
              {setSpawn && spawnTypeTab === 0 && (
                <InputSelect
                  name="user"
                  label={t('admin:components.invite.user')}
                  value={userInviteCode}
                  menu={userMenu}
                  disabled={false}
                  onChange={handleUserChange}
                />
              )}
              {setSpawn && spawnTypeTab === 1 && (
                <InputSelect
                  name="spawnPoint"
                  label={t('admin:components.invite.spawnPoint')}
                  value={spawnPointUUID}
                  menu={spawnPointMenu}
                  disabled={false}
                  onChange={handleSpawnPointChange}
                />
              )}
            </div>
          )}
          <Button
            className={styles.submitButton}
            type="button"
            variant="contained"
            color="primary"
            disabled={disableSendButton()}
            onClick={submitInvites}
          >
            {t('admin:components.invite.submit')}
          </Button>
        </FormGroup>
      </Container>
    </DrawerView>
  )
}

export default CreateInviteModal
