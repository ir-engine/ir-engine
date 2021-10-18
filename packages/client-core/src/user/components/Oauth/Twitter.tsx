import { useLocation, withRouter } from 'react-router-dom'
import React, { useState, useEffect } from 'react'
import { AuthService } from '../../state/AuthService'
import Container from '@material-ui/core/Container'
import { useAuthState } from '../../state/AuthState'
import { useDispatch } from '../../../store'
import { useTranslation } from 'react-i18next'

const TwitterCallbackComponent = (props): any => {
  const { loginUserByJwt, refreshConnections } = props
  const { t } = useTranslation()
  const dispatch = useDispatch()
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
      {t('user:oauth.authFailed', { service: 'Twitter' })}
      <br />
      {state.error}
    </Container>
  ) : (
    <Container>{t('user:oauth.authenticating')}</Container>
  )
}

export const TwitterCallback = withRouter(TwitterCallbackComponent) as any
