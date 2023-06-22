/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@etherealengine/client-core/src/common/components/Button'
import commonStyles from '@etherealengine/client-core/src/common/components/common.module.scss'
import InputRadio from '@etherealengine/client-core/src/common/components/InputRadio'
import InputText from '@etherealengine/client-core/src/common/components/InputText'
import Menu from '@etherealengine/client-core/src/common/components/Menu'
import { InstanceService } from '@etherealengine/client-core/src/common/services/InstanceService'
import { useRouter } from '@etherealengine/client-core/src/common/services/RouterService'
import { requestXRSession } from '@etherealengine/engine/src/xr/XRSessionFunctions'
import { XRAction } from '@etherealengine/engine/src/xr/XRState'
import { dispatchAction } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'

import styles from '../index.module.scss'
import { PopupMenuServices } from '../PopupMenuService'

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
    requestXRSession()
  }

  const handleCreate = async () => {
    if (!location && !locationName) {
      setError(t('user:roomMenu.locationRequired'))
      return false
    }

    route(`/location/${location ? location : locationName}`)
    requestXRSession()
  }

  return (
    <Menu open onClose={() => PopupMenuServices.showPopupMenu()}>
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
