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

import { useMutableState } from '@ir-engine/hyperflux'
import { motion } from 'motion/react'
import React from 'react'
import { AuthService, AuthState } from '../../user/services/AuthService'
import { NavigateFuncProps } from '../Glass/NavigationProvider'
import ButtonGroup from './ButtonGroup'

type DeleteAccountScreenProps = NavigateFuncProps & {}

const DeleteAccountScreen: React.FC<DeleteAccountScreenProps> = ({ navigateTo, navigateClose }) => {
  const { id } = useMutableState(AuthState).user

  const handleDelete = () => {
    AuthService.removeUser(id.value)
    // This will force a full page reload
    AuthService.logoutUser()
  }

  const handleStayHere = () => {
    navigateTo('settings/account')
  }

  return (
    <div className="flex h-full flex-col items-center justify-between space-y-8 pb-4 text-center">
      {/* Confirmation Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex h-full flex-1 flex-col items-center justify-center space-y-2"
      >
        <p className="text-lg font-medium text-white/90 md:text-2xl">Are you sure you want to</p>
        <p className="text-lg font-medium text-white/90 md:text-2xl">delete your account?</p>
      </motion.div>

      {/* Action Buttons */}
      <ButtonGroup
        options={[
          { label: 'Stay Here', onClick: handleStayHere },
          { label: 'Delete', onClick: handleDelete }
        ]}
      />
    </div>
  )
}

export default DeleteAccountScreen
