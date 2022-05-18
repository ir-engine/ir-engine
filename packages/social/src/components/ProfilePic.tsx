import React from 'react'
import { useHistory } from 'react-router-dom'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { useTranslation } from 'react-i18next'

export function ProfilePic({ src, username, size, border, href, ...props }: any) {
  const history = useHistory()
  const { t } = useTranslation()
  return (
    <span {...props} onClick={() => history.push(`/${username}`)}>
      {src ? (
        <img
          alt={t('social:profilePic', { user: username })}
          data-testid="user-avatar"
          draggable="false"
          src={src}
          style={{
            width: size,
            height: size,
            borderRadius: size,
            border: border && '2px solid white',
            cursor: 'pointer'
          }}
        />
      ) : (
        <AccountCircleIcon fontSize="large" />
      )}
    </span>
  )
}
