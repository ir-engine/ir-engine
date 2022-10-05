import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import adminStyles from '@xrengine/client-core/src/admin/styles/admin.module.scss'
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

import { RoomService } from '../../../../common/services/RoomService'
import styles from './RoomMenu.scss'

interface Props {
  location: string
}

const roomCodeCharacters = '123456789'

const numberize = (str: string) => {
  const chars = str.split('')
  const validChars = chars.map((char) => (roomCodeCharacters.includes(char) ? char : ''))
  return validChars.join('')
}

const generateRoomCode = () => {
  let code = ''
  for (let i = 0; i < 6; i++) code += roomCodeCharacters.charAt(Math.floor(Math.random() * roomCodeCharacters.length))
  return code
}

const RoomMenu = ({ location }: Props): JSX.Element => {
  const { t } = useTranslation()
  const route = useRouter()
  const defaultCode = generateRoomCode()
  const [roomCode, setRoomCode] = useState(defaultCode)
  const [source, setSource] = useState('create')
  const [error, setError] = useState('')

  const validate = () => {
    if (roomCode.length !== 6) {
      setError(t('user:roomMenu.rootCodeLength'))
      return false
    }

    setError('')
    return true
  }

  const handleSourceChange = (e) => {
    const { value } = e.target

    const defaultCode = generateRoomCode()
    setError('')
    setRoomCode(value === 'create' ? defaultCode : '')
    setSource(value)
  }

  const handleRoomCode = async (e) => {
    const number = numberize(e.target.value)
    setRoomCode(number)
  }

  const handleJoin = async () => {
    if (validate()) {
      const rooms = await RoomService.fetchRoom(roomCode)

      if (rooms.data.length === 0) {
        setError(t('user:roomMenu.invalidRoomCode'))
        return
      }

      route(`/location/${location}?roomCode=${rooms.data[0].roomCode}&instanceId=${rooms.data[0].instanceId}`)
      dispatchAction(XRAction.requestSession({}))
    }
  }

  const handleCreate = async () => {
    if (validate()) {
      const rooms = await RoomService.fetchRoom(roomCode)

      if (rooms.data.length !== 0) {
        setError(t('user:roomMenu.duplicateRoomCode'))
        return
      }

      route(`/location/${location}?roomCode=${roomCode}`)
      dispatchAction(XRAction.requestSession({}))
    }
  }

  return (
    <>
      <style>{styles}</style>

      <div className={`${menuStyles.menuPanel} roomMenu`}>
        <div className={menuStyles.settingPanel}>
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

              <section
                className={`${menuStyles.emailPhoneSection} inputSection ${source === 'create' ? '' : 'disabled'}`}
              >
                <Typography variant="h1" className={menuStyles.panelHeader}>
                  {t('user:roomMenu.createRoomCode')}
                </Typography>
                <TextField
                  className={menuStyles.emailField}
                  size="small"
                  placeholder={t('user:roomMenu.roomCode')}
                  variant="outlined"
                  onChange={handleRoomCode}
                  value={source === 'create' ? roomCode : ''}
                  error={source === 'create' && error ? true : false}
                  helperText={source === 'create' && error ? error : null}
                  disabled={source !== 'create'}
                  fullWidth
                />
              </section>

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
                  value={source === 'join' ? roomCode : ''}
                  error={source === 'join' && error ? true : false}
                  helperText={source === 'join' && error ? error : null}
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
