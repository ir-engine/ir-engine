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

import { SnackbarKey, SnackbarProvider, VariantType, closeSnackbar } from 'notistack'
import React, { CSSProperties, Fragment, useEffect, useRef } from 'react'

import multiLogger from '@ir-engine/common/src/logger'
import { defineState, getState, useMutableState } from '@ir-engine/hyperflux'

import { MdClose } from 'react-icons/md'
import InviteSnackbarActions from '../../components/InviteToast/InviteSnackbarActions'

const logger = multiLogger.child({ component: 'client-core:Notification' })

export const NotificationState = defineState({
  name: 'ee.client.NotificationState',
  initial: {
    snackbar: null as SnackbarProvider | null | undefined
  }
})

export type NotificationOptions = {
  variant: VariantType // 'default' | 'error' | 'success' | 'warning' | 'info'
  actionType?: keyof typeof NotificationActions
  persist?: boolean
  style?: CSSProperties
  hideIconVariant?: boolean
}

export const defaultAction = (key: SnackbarKey, content?: React.ReactNode) => {
  return (
    <Fragment>
      {content}
      <button onClick={() => closeSnackbar(key)}>
        <MdClose size="1.2rem" />
      </button>
    </Fragment>
  )
}
export const inviteActions = (key: SnackbarKey, content?: React.ReactNode) => {
  return (
    <Fragment>
      {content}
      <InviteSnackbarActions closeSnackbar={() => closeSnackbar(key)} />
    </Fragment>
  )
}

export const NotificationActions = {
  default: defaultAction,
  invite: inviteActions
}

export const NotificationService = {
  dispatchNotify(message: React.ReactNode, options: NotificationOptions) {
    if (options?.variant === 'error') {
      logger.error(new Error(message!.toString()))
    }

    const state = getState(NotificationState)
    return state.snackbar?.enqueueSnackbar(message, {
      variant: options.variant,
      action: NotificationActions[options.actionType ?? 'default'],
      persist: options.persist,
      style: options.style,
      hideIconVariant: options.hideIconVariant
    })
  },
  closeNotification(key: SnackbarKey) {
    const state = getState(NotificationState)
    state.snackbar?.closeSnackbar(key)
  }
}

export const NotificationSnackbar = (props: { style?: CSSProperties }) => {
  const notistackRef = useRef<SnackbarProvider>()
  const notificationstate = useMutableState(NotificationState)

  useEffect(() => {
    notificationstate.snackbar.set(notistackRef.current)
  }, [notistackRef.current])

  return (
    <SnackbarProvider
      ref={notistackRef as any}
      maxSnack={7}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      action={defaultAction}
      style={props.style}
    />
  )
}
