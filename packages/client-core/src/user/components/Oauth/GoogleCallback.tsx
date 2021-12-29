import { useLocation, withRouter } from 'react-router-dom'
import React, { useState, useEffect } from 'react'
import { AuthService } from '../../services/AuthService'
import Container from '@mui/material/Container'
import { useAuthState } from '../../services/AuthService'
import { useTranslation } from 'react-i18next'

const GoogleCallbackComponent = (props): any => {
  const { t } = useTranslation()
  const initialState = { error: '', token: '' }
  const [state, setState] = useState(initialState)
  const search = new URLSearchParams(useLocation().search)

  useEffect(() => {
    const error = search.get('error') as string
    const token = search.get('token') as string
    const type = search.get('type') as string
    const path = search.get('path') as string
    const instanceId = search.get('instanceId') as string

    if (!error) {
      if (type === 'connection') {
        const user = useAuthState().user
        AuthService.refreshConnections(user.id.value)
      } else {
        let redirectSuccess = `${path}`
        if (instanceId != null) redirectSuccess += `?instanceId=${instanceId}`
        AuthService.loginUserByJwt(token, redirectSuccess || '/', '/')
      }
    }

    setState({ ...state, error, token })
  }, [])

  return state.error && state.error !== '' ? (
    <Container>
      {t('user:oauth.authFailed', { service: 'Google' })}
      <br />
      {state.error}
    </Container>
  ) : (
    <Container>{t('user:oauth.authenticating')}</Container>
  )
}

export const GoogleCallback = withRouter(GoogleCallbackComponent) as any
