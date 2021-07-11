import React from 'react'
import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function UsernameText({ username, ...props }: any) {
  const history = useHistory()
  const { t } = useTranslation()
  return (
    <a className="text-14-bold mr-1 cursor-pointer" onClick={() => history.push(`/${username}`)} {...props}>
      {username || t('social:username')}
    </a>
  )
}
