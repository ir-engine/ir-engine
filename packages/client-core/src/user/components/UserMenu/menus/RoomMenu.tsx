import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import adminStyles from '@xrengine/client-core/src/admin/styles/admin.module.scss'
import { InstanceService } from '@xrengine/client-core/src/common/services/InstanceService'
import { useRouter } from '@xrengine/client-core/src/common/services/RouterService'
import menuStyles from '@xrengine/client-core/src/user/components/UserMenu/index.module.scss'
import { AudioEffectPlayer } from '@xrengine/engine/src/audio/systems/MediaSystem'
import { XRAction } from '@xrengine/engine/src/xr/XRState'
import { dispatchAction } from '@xrengine/hyperflux'

import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import styles from './RoomMenu.scss'

interface Props {
  location?: string
}

const roomCodeCharacters = '123456789'

const numberize = (str: string) => {
  const chars = str.split('')
  const validChars = chars.map((char) => (roomCodeCharacters.includes(char) ? char : ''))
  return validChars.join('')
}

const RoomMenu = ({ location }: Props): JSX.Element => {
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
    <>
      <style>{styles}</style>

      <div className={`${menuStyles.menuPanel} roomMenu`}>
        <div className={menuStyles.settingPanel}>
          {!location && (
            <TextField
              className={menuStyles.emailField}
              size="small"
              placeholder={t('user:roomMenu.locationName')}
              variant="outlined"
              onChange={handleLocationName}
              value={locationName}
              error={!location && !locationName && error ? true : false}
              helperText={!location && !locationName && error ? error : null}
              fullWidth
            />
          )}

          <hr className="divider" />

          <FormControl className={adminStyles.radioField} fullWidth>
            <RadioGroup value={source} onChange={handleSourceChange}>
              <FormControlLabel
                value="create"
                control={<Radio />}
                label={
                  <Typography variant="h5" className="radioLabel">
                    {t('user:roomMenu.createRoom')}
                  </Typography>
                }
              />

              <Button
                className="button"
                disabled={source !== 'create'}
                onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                onClick={handleCreate}
              >
                {t('user:roomMenu.create')}
              </Button>

              <hr className="divider" />

              <FormControlLabel
                value="join"
                control={<Radio />}
                label={
                  <Typography variant="h5" className="radioLabel">
                    {t('user:roomMenu.joinRoom')}
                  </Typography>
                }
              />

              <section
                className={`${menuStyles.emailPhoneSection} inputSection ${source === 'join' ? '' : 'disabled'}`}
              >
                <Typography variant="h1" className={menuStyles.panelHeader}>
                  {t('user:roomMenu.joinRoomCode')}
                </Typography>
                <TextField
                  className={menuStyles.emailField}
                  size="small"
                  placeholder={t('user:roomMenu.roomCode')}
                  variant="outlined"
                  onChange={handleRoomCode}
                  value={roomCode}
                  error={(location || locationName) && source === 'join' && error ? true : false}
                  helperText={(location || locationName) && source === 'join' && error ? error : null}
                  disabled={source !== 'join'}
                  fullWidth
                />
              </section>

              <Button
                className="button"
                disabled={source !== 'join'}
                onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                onClick={handleJoin}
              >
                {t('user:roomMenu.join')}
              </Button>
            </RadioGroup>
          </FormControl>
        </div>
      </div>
    </>
  )
}

export default RoomMenu
