import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@etherealengine/client-core/src/common/components/Button'
import commonStyles from '@etherealengine/client-core/src/common/components/common.module.scss'
import InputRadio from '@etherealengine/client-core/src/common/components/InputRadio'
import InputText from '@etherealengine/client-core/src/common/components/InputText'
import Menu from '@etherealengine/client-core/src/common/components/Menu'
import { InstanceService } from '@etherealengine/client-core/src/common/services/InstanceService'
import { useRouter } from '@etherealengine/client-core/src/common/services/RouterService'
import { XRAction } from '@etherealengine/engine/src/xr/XRState'
import { dispatchAction } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/Box'

import styles from '../index.module.scss'
import { Views } from '../util'

interface Props {
  changeActiveMenu?: Function
  location?: string
}

const roomCodeCharacters = '123456789'

const numberize = (str: string) => {
  const chars = str.split('')
  const validChars = chars.map((char) => (roomCodeCharacters.includes(char) ? char : ''))
  return validChars.join('')
}

const RoomMenu = ({ changeActiveMenu, location }: Props): JSX.Element => {
  const { t } = useTranslation()
  const route = useRouter()
  const [locationName, setLocationName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [source, setSource] = useState('create')
  const [error, setError] = useState('')

  const handleSourceChange = (e) => {
    const { value } = e.target

    setError('')
    setRoomCode('')
    setSource(value)
  }

  const handleRoomCode = async (e) => {
    const number = numberize(e.target.value)
    setRoomCode(number)
  }

  const handleLocationName = async (e) => {
    setLocationName(e.target.value)
    setError('')
  }

  const handleJoin = async () => {
    if (!location && !locationName) {
      setError(t('user:roomMenu.locationRequired'))
      return false
    }

    if (roomCode.length !== 6) {
      setError(t('user:roomMenu.roomCodeLength'))
      return false
    }

    const rooms = await InstanceService.checkRoom(roomCode)
    if (!rooms) {
      setError(t('user:roomMenu.invalidRoomCode'))
      return
    }
    route(`/location/${location ? location : locationName}?roomCode=${rooms.roomCode}`)
    dispatchAction(XRAction.requestSession({}))
  }

  const handleCreate = async () => {
    if (!location && !locationName) {
      setError(t('user:roomMenu.locationRequired'))
      return false
    }

    route(`/location/${location ? location : locationName}`)
    dispatchAction(XRAction.requestSession({}))
  }

  return (
    <Menu open onClose={() => changeActiveMenu && changeActiveMenu(Views.Closed)}>
      <Box className={styles.menuContent}>
        {!location && (
          <InputText
            error={!location && !locationName && error ? error : undefined}
            label={t('user:roomMenu.locationName')}
            value={locationName}
            onChange={handleLocationName}
          />
        )}

        <hr className={commonStyles.divider} />

        <InputRadio
          value={source}
          type="block"
          options={[
            {
              value: 'create',
              label: t('user:roomMenu.createRoom'),
              overflowContent: (
                <>
                  <Button type="gradientRounded" disabled={source !== 'create'} size="medium" onClick={handleCreate}>
                    {t('user:roomMenu.create')}
                  </Button>

                  <hr className={commonStyles.divider} />
                </>
              )
            },
            {
              value: 'join',
              label: t('user:roomMenu.joinRoom')
            }
          ]}
          sx={{ flexDirection: 'column', width: '100%' }}
          onChange={handleSourceChange}
        />

        <InputText
          disabled={source !== 'join'}
          error={(location || locationName) && source === 'join' && error ? error : undefined}
          label={t('user:roomMenu.joinRoomCode')}
          placeholder={t('user:roomMenu.roomCode')}
          value={roomCode}
        />

        <Box display="flex" alignItems="center">
          <Button type="gradientRounded" disabled={source !== 'join'} size="medium" onClick={handleJoin}>
            {t('user:roomMenu.join')}
          </Button>
        </Box>
      </Box>
    </Menu>
  )
}

export default RoomMenu
