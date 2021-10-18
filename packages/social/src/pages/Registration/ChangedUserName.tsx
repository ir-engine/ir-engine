import React, { useState } from 'react'
import styles from './Registration.module.scss'
import { TextField, InputAdornment } from '@material-ui/core'
import { Check } from '@material-ui/icons'
import { useTranslation } from 'react-i18next'

const ChangedUserName = ({ defaultValue, updateUserName }) => {
  const { t } = useTranslation()
  const [myValue, setMyValue] = useState(defaultValue)
  return (
    <TextField
      margin="none"
      size="small"
      label={t('user:usermenu.profile.lbl-username')}
      variant="outlined"
      value={myValue}
      onChange={(e) => {
        setMyValue(e.target.value)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') updateUserName(myValue)
      }}
      className={styles.usernameInput}
      InputProps={{
        endAdornment: (
          <InputAdornment
            style={{
              cursor: 'pointer'
            }}
            onClick={() => {
              updateUserName(myValue)
            }}
            position="end"
          >
            <Check className={styles.primaryForeground} />
          </InputAdornment>
        )
      }}
    />
  )
}

export default ChangedUserName
