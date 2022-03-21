import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button, Paper, Typography } from '@mui/material'
import InputBase from '@mui/material/InputBase'

import { useAuthState } from '../../../user/services/AuthService'
import { ClientSettingService, useClientSettingState } from '../../services/Setting/ClientSettingService'
import styles from '../../styles/settings.module.scss'

interface clientProps {}

const Client = (props: clientProps) => {
  const clientSettingState = useClientSettingState()
  const [clientSetting] = clientSettingState?.client?.value || []
  const id = clientSetting?.id
  const [logo, setLogo] = useState(clientSetting?.logo)
  const [title, setTitle] = useState(clientSetting?.title)
  const [icon192px, setIcon192px] = useState(clientSetting?.icon192px)
  const [icon512px, setIcon512px] = useState(clientSetting?.icon512px)
  const [favicon16px, setFavicon16px] = useState(clientSetting?.favicon16px)
  const [favicon32px, setFavicon32px] = useState(clientSetting?.favicon32px)
  const [siteDescription, setSiteDescription] = useState(clientSetting?.siteDescription)
  const { t } = useTranslation()

  const authState = useAuthState()
  const user = authState.user

  const handleSave = (e) => {
    e.preventDefault()
  }

  useEffect(() => {
    if (user?.id?.value != null && clientSettingState?.updateNeeded?.value === true) {
      ClientSettingService.fetchClientSettings()
    }
  }, [authState?.user?.id?.value, clientSettingState?.updateNeeded?.value])

  useEffect(() => {
    if (clientSetting) {
      setLogo(clientSetting?.logo)
      setTitle(clientSetting?.title)
      setIcon192px(clientSetting?.icon192px)
      setIcon512px(clientSetting?.icon512px)
      setFavicon16px(clientSetting?.favicon16px)
      setFavicon32px(clientSetting?.favicon32px)
      setSiteDescription(clientSetting?.siteDescription)
    }
  }, [clientSettingState?.updateNeeded?.value])

  const handleSubmit = (event) => {
    event.preventDefault()

    ClientSettingService.patchClientSetting(
      {
        logo: logo,
        title: title,
        icon192px: icon192px,
        icon512px: icon512px,
        favicon16px: favicon16px,
        favicon32px: favicon32px,
        siteDescription: siteDescription
      },
      id
    )
  }

  const handleCancel = () => {
    setLogo(clientSetting?.logo)
    setTitle(clientSetting?.title)
    setIcon192px(clientSetting?.icon192px)
    setIcon512px(clientSetting?.icon512px)
    setFavicon16px(clientSetting?.favicon16px)
    setFavicon32px(clientSetting?.favicon32px)
    setSiteDescription(clientSetting?.siteDescription)
  }

  return (
    <div className={styles.clientSettingsContainer}>
      <form onSubmit={handleSave}>
        <Typography component="h1" className={styles.settingsHeading}>
          {t('admin:components.setting.client')}
        </Typography>
        <label>{t('admin:components.setting.title')}</label>
        <Paper component="div" className={styles.createInput}>
          <InputBase
            name="title"
            className={styles.input}
            style={{ color: '#fff' }}
            value={title || ''}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Paper>
        <label>{t('admin:components.setting.description')}</label>
        <Paper component="div" className={styles.createInput}>
          <InputBase
            name="title"
            className={styles.input}
            style={{ color: '#fff' }}
            value={siteDescription || ''}
            onChange={(e) => setSiteDescription(e.target.value)}
          />
        </Paper>
        <label>{t('admin:components.setting.logo')}</label>
        <Paper component="div" className={styles.createInput}>
          <InputBase
            name="logo"
            className={styles.input}
            style={{ color: '#fff' }}
            value={logo || ''}
            onChange={(e) => setLogo(e.target.value)}
          />
        </Paper>
        <label>{t('admin:components.setting.icon192px')}</label>
        <Paper component="div" className={styles.createInput}>
          <InputBase
            name="logo"
            className={styles.input}
            style={{ color: '#fff' }}
            value={icon192px || ''}
            onChange={(e) => setIcon192px(e.target.value)}
          />
        </Paper>
        <label>{t('admin:components.setting.icon512px')}</label>
        <Paper component="div" className={styles.createInput}>
          <InputBase
            name="logo"
            className={styles.input}
            style={{ color: '#fff' }}
            value={icon512px || ''}
            onChange={(e) => setIcon512px(e.target.value)}
          />
        </Paper>
        <label>{t('admin:components.setting.favIcon16px')}</label>
        <Paper component="div" className={styles.createInput}>
          <InputBase
            name="logo"
            className={styles.input}
            style={{ color: '#fff' }}
            value={favicon16px || ''}
            onChange={(e) => setFavicon16px(e.target.value)}
          />
        </Paper>
        <label>{t('admin:components.setting.favIcon32px')}</label>
        <Paper component="div" className={styles.createInput}>
          <InputBase
            name="logo"
            className={styles.input}
            style={{ color: '#fff' }}
            value={favicon32px || ''}
            onChange={(e) => setFavicon32px(e.target.value)}
          />
        </Paper>
        <label>{t('admin:components.setting.url')}</label>
        <Paper component="div" className={styles.createInput}>
          <InputBase
            name="url"
            className={styles.input}
            disabled
            style={{ color: '#fff' }}
            value={clientSetting?.url || ''}
          />
        </Paper>
        <label>{t('admin:components.setting.releaseName')}</label>
        <Paper component="div" className={styles.createInput}>
          <InputBase
            name="releaseName"
            className={styles.input}
            disabled
            style={{ color: '#fff' }}
            value={clientSetting?.releaseName || ''}
          />
        </Paper>
        <Button sx={{ maxWidth: '100%' }} variant="outlined" style={{ color: '#fff' }} onClick={handleCancel}>
          {t('admin:components.setting.cancel')}
        </Button>
        &nbsp;&nbsp;
        <Button
          sx={{ maxWidth: '100%' }}
          variant="contained"
          className={styles.saveBtn}
          type="submit"
          onClick={handleSubmit}
        >
          {t('admin:components.setting.save')}
        </Button>
      </form>
    </div>
  )
}

export default Client
