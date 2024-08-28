/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@ir-engine/client-core/src/common/components/Button'
import commonStyles from '@ir-engine/client-core/src/common/components/common.module.scss'
import InputRadio from '@ir-engine/client-core/src/common/components/InputRadio'
import InputText from '@ir-engine/client-core/src/common/components/InputText'
import Menu from '@ir-engine/client-core/src/common/components/Menu'
import { RouterState } from '@ir-engine/client-core/src/common/services/RouterService'
import { instancePath, RoomCode } from '@ir-engine/common/src/schema.type.module'
import { useFind } from '@ir-engine/common'
import { requestXRSession } from '@ir-engine/spatial/src/xr/XRSessionFunctions'
import Box from '@ir-engine/ui/src/primitives/mui/Box'

import styles from '../index.module.scss'
import { PopupMenuServices } from '../PopupMenuService'

interface Props {
  location?: string
}

const RoomMenu = ({ location }: Props): JSX.Element => {
  const { t } = useTranslation()
  const [locationName, setLocationName] = useState('')
  const [roomCode, setRoomCode] = useState('' as RoomCode)
  const [source, setSource] = useState('create')
  const [error, setError] = useState('')
  const roomsQuery = useFind(instancePath, { query: { roomCode, ended: false, locationId: { $ne: undefined } } })

  const handleSourceChange = (e) => {
    const { value } = e.target

    setError('')
    setRoomCode('' as RoomCode)
    setSource(value)
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

    const rooms = roomsQuery.data.at(0)

    if (!rooms) {
      setError(t('user:roomMenu.invalidRoomCode'))
      return
    }
    RouterState.navigate(`/location/${location ? location : locationName}?roomCode=${rooms.roomCode}`)
    requestXRSession()
  }

  const handleCreate = async () => {
    if (!location && !locationName) {
      setError(t('user:roomMenu.locationRequired'))
      return false
    }

    RouterState.navigate(`/location/${location ? location : locationName}`)
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
