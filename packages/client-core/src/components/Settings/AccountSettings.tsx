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

import React from 'react'

import { useMutableState } from '@ir-engine/hyperflux'
import Divider from '@ir-engine/ui/src/components/viewer/Divider'
import { AuthState } from '../../user/services/AuthService'
import { NavigateFuncProps } from '../Glass/NavigationProvider'
import { Inner } from '../Glass/ToolbarAndSidebar'
import { MenuItem } from './MenuItem'
import { Section } from './Section'

// Define types for screen components
type ScreenProps = NavigateFuncProps & {}

const AccountSettings: React.FC<ScreenProps> = ({ navigateTo }) => {
  const isGuest = useMutableState(AuthState).user.isGuest.value

  return (
    <Inner className="min-h-full space-y-4">
      <Section>
        <MenuItem label="Display Name" onClick={() => navigateTo('settings/display')} hasChevron />
        {isGuest && (
          <>
            <Divider />
            <MenuItem label="Sign Up" onClick={() => navigateTo('settings/signup')} hasChevron />
          </>
        )}
      </Section>

      {!isGuest && (
        <Section>
          <MenuItem label="Single Sign On" onClick={() => navigateTo('settings/sso')} hasChevron />
        </Section>
      )}
    </Inner>
  )
}

export default AccountSettings
