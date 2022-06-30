import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { isShareAvailable } from '@xrengine/engine/src/common/functions/DetectFeatures'

import { FileCopy } from '@mui/icons-material'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { PartyService } from '../../../../social/services/PartyService'
import styles from '../index.module.scss'

export const usePartyMenuHooks = () => {
  const { t } = useTranslation()

  const joinParty = () => {
    PartyService.createParty()
  }

  return {
    joinParty
  }
}

const ShareMenu = (): JSX.Element => {
  const { t } = useTranslation()

  const refLink = useRef() as React.MutableRefObject<HTMLInputElement>

  const { joinParty } = usePartyMenuHooks()

  return (
    <div className={styles.menuPanel}>
      <div className={styles.sharePanel}>
        <Typography variant="h1" className={styles.panelHeader}>
          {t('user:usermenu.party.title')}
        </Typography>
        <div className={styles.sendInviteContainer}>
          <Button className={styles.sendInvite} onClick={joinParty}>
            {t('user:usermenu.party.join')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ShareMenu
