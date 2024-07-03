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

import { SnackbarKey, SnackbarProvider, VariantType, closeSnackbar } from 'notistack'
import React, { CSSProperties, Fragment, useEffect, useRef } from 'react'

import multiLogger from '@etherealengine/common/src/logger'
import { defineState, getState, useMutableState } from '@etherealengine/hyperflux'

import Icon from '@etherealengine/ui/src/primitives/mui/Icon'

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
}

export const defaultAction = (key: SnackbarKey, content?: React.ReactNode) => {
  return (
    <Fragment>
      {content}
      <Icon onClick={() => closeSnackbar(key)} type={'Close'} />
    </Fragment>
  )
}

export const NotificationActions = {
  default: defaultAction
}

export const NotificationService = {
  dispatchNotify(message: string, options: NotificationOptions) {
    if (options?.variant === 'error') {
      logger.error(new Error(message))
    }

    const state = getState(NotificationState)
    state.snackbar?.enqueueSnackbar(message, {
      variant: options.variant,
      action: NotificationActions[options.actionType ?? 'default']
    })
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
