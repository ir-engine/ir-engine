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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { useHookstate } from '@hookstate/core'
import { USERNAME_MAX_LENGTH } from '@ir-engine/common/src/constants/UserConstants'
import multiLogger from '@ir-engine/common/src/logger'
import { INVALID_USER_NAME_REGEX } from '@ir-engine/common/src/regex'
import { UserName } from '@ir-engine/common/src/schema.type.module'
import { useMutableState } from '@ir-engine/hyperflux'
import { GlassButton } from '@ir-engine/ui/src/components/viewer/Button'
import React, { useEffect, useMemo } from 'react'
import { AuthState } from '../../user/services/AuthService'
import { AvatarService } from '../../user/services/AvatarService'
import { clientContextParams } from '../../util/ClientContextState'
import { NavigateFuncProps } from '../Glass/NavigationProvider'
import FieldItem from './FieldItem'
import { Section } from './Section'

type DisplayNameScreenProps = NavigateFuncProps & {}
const logger = multiLogger.child({ component: 'engine:ecs:DisplayName', modifier: clientContextParams })

const DisplayNameScreen: React.FC<DisplayNameScreenProps> = () => {
  const { name, id } = useMutableState(AuthState).user
  const displayName = useHookstate(name.value as string)
  const saved = useHookstate(false)

  const isUsernameValid = useMemo(() => {
    const validInput = displayName.value.replace(INVALID_USER_NAME_REGEX, '')
    return validInput.length > 0 && validInput.length <= USERNAME_MAX_LENGTH
  }, [displayName.value])

  const onSave = () => {
    const name = displayName.value.trim() as UserName
    if (!name) return
    AvatarService.updateUsername(id.value, name).then(() => {
      saved.set(true)
      logger.analytics({
        event_name: 'rename_user'
      })
    })
  }

  useEffect(() => {
    if (saved.value) {
      setTimeout(() => {
        saved.set(false)
      }, 2000)
    }
  }, [saved.value])

  return (
    <div className="flex h-full flex-col justify-between gap-4">
      <Section>
        <FieldItem
          label="Display Name"
          value={displayName.value}
          onChange={(value) => {
            if (value.length <= USERNAME_MAX_LENGTH) displayName.set(value)
          }}
          isDirty={displayName.value !== name.value}
          onReset={() => displayName.set(name.value as string)}
        />
      </Section>
      <GlassButton disabled={!isUsernameValid} onClick={onSave} className="mx-auto justify-self-end">
        {saved.value ? 'Saved!' : 'Save'}
      </GlassButton>
    </div>
  )
}

export default DisplayNameScreen
