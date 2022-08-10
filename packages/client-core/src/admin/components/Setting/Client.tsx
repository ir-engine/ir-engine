import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { Box, Button, Grid, IconButton, Typography } from '@mui/material'

import { useAuthState } from '../../../user/services/AuthService'
import InputText from '../../common/InputText'
import { ClientSettingService, useClientSettingState } from '../../services/Setting/ClientSettingService'
import styles from '../../styles/settings.module.scss'

const Client = () => {
  const { t } = useTranslation()

  const authState = useAuthState()
  const user = authState.user

  const clientSettingState = useClientSettingState()
  const [clientSetting] = clientSettingState?.client?.value || []
  const id = clientSetting?.id
  const [logo, setLogo] = useState(clientSetting?.logo)
  const [title, setTitle] = useState(clientSetting?.title)
  const [appTitle, setAppTitle] = useState(clientSetting?.appTitle)
  const [appSubtitle, setAppSubtitle] = useState(clientSetting?.appSubtitle)
  const [appDescription, setAppDescription] = useState(clientSetting?.appDescription)
  const [appBackground, setAppBackground] = useState(clientSetting?.appBackground)
  const [appSocialLinks, setAppSocialLinks] = useState(clientSetting?.appSocialLinks || [])
  const [icon192px, setIcon192px] = useState(clientSetting?.icon192px)
  const [icon512px, setIcon512px] = useState(clientSetting?.icon512px)
  const [favicon16px, setFavicon16px] = useState(clientSetting?.favicon16px)
  const [favicon32px, setFavicon32px] = useState(clientSetting?.favicon32px)
  const [siteDescription, setSiteDescription] = useState(clientSetting?.siteDescription)

  useEffect(() => {
    if (user?.id?.value != null && clientSettingState?.updateNeeded?.value === true) {
      ClientSettingService.fetchClientSettings()
    }
  }, [authState?.user?.id?.value, clientSettingState?.updateNeeded?.value])

  useEffect(() => {
    if (clientSetting) {
      setLogo(clientSetting?.logo)
      setTitle(clientSetting?.title)
      setAppTitle(clientSetting?.appTitle)
      setAppSubtitle(clientSetting?.appSubtitle)
      setAppDescription(clientSetting?.appDescription)
      setAppBackground(clientSetting?.appBackground)
      setAppSocialLinks(clientSetting?.appSocialLinks || [])
      setIcon192px(clientSetting?.icon192px)
      setIcon512px(clientSetting?.icon512px)
      setFavicon16px(clientSetting?.favicon16px)
      setFavicon32px(clientSetting?.favicon32px)
      setSiteDescription(clientSetting?.siteDescription)
    }
  }, [clientSettingState?.updateNeeded?.value])

  const handleUpdateSocialLinks = (index, value, type) => {
    const tempAppSocialLinks = JSON.parse(JSON.stringify(appSocialLinks))

    tempAppSocialLinks[index][type] = value

    setAppSocialLinks(tempAppSocialLinks)
  }

  const handleAddSocialLinks = () => {
    const tempAppSocialLinks = JSON.parse(JSON.stringify(appSocialLinks))

    tempAppSocialLinks.push({ icon: '', link: '' })

    setAppSocialLinks(tempAppSocialLinks)
  }

  const handleRemoveSocialLinks = (index) => {
    const tempAppSocialLinks = JSON.parse(JSON.stringify(appSocialLinks))

    tempAppSocialLinks.splice(index, 1)

    setAppSocialLinks(tempAppSocialLinks)
  }

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
        siteDescription: siteDescription,
        appTitle: appTitle,
        appSubtitle: appSubtitle,
        appDescription: appDescription,
        appBackground: appBackground,
        appSocialLinks: JSON.stringify(appSocialLinks),
        themeSettings: JSON.stringify(clientSetting?.themeSettings),
        themeModes: JSON.stringify(clientSetting?.themeModes)
      },
      id
    )
  }

  const handleCancel = () => {
    setLogo(clientSetting?.logo)
    setTitle(clientSetting?.title)
    setAppTitle(clientSetting?.appTitle)
    setAppSubtitle(clientSetting?.appSubtitle)
    setAppDescription(clientSetting?.appDescription)
    setAppBackground(clientSetting?.appBackground)
    setAppSocialLinks(clientSetting?.appSocialLinks)
    setIcon192px(clientSetting?.icon192px)
    setIcon512px(clientSetting?.icon512px)
    setFavicon16px(clientSetting?.favicon16px)
    setFavicon32px(clientSetting?.favicon32px)
    setSiteDescription(clientSetting?.siteDescription)
  }

  return (
    <Box>
      <Typography component="h1" className={styles.settingsHeading}>
        {t('admin:components.setting.client')}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <InputText
            name="appTitle"
            label={t('admin:components.setting.appTitle')}
            value={appTitle || ''}
            onChange={(e) => setAppTitle(e.target.value)}
          />

          <InputText
            name="appSubtitle"
            label={t('admin:components.setting.appSubtitle')}
            value={appSubtitle || ''}
            onChange={(e) => setAppSubtitle(e.target.value)}
          />

          <InputText
            name="appDescription"
            label={t('admin:components.setting.appDescription')}
            value={appDescription || ''}
            onChange={(e) => setAppDescription(e.target.value)}
          />

          <InputText
            name="appBackground"
            label={t('admin:components.setting.appBackground')}
            value={appBackground || ''}
            onChange={(e) => setAppBackground(e.target.value)}
          />

          <Typography className={styles.settingsSubHeading}>{t('admin:components.setting.appSocialLinks')}</Typography>

          {appSocialLinks?.length > 0 &&
            appSocialLinks?.map((socialLink, index) => (
              <Box key={index} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 1 }}>
                <InputText
                  sx={{ flexGrow: 1 }}
                  name="socialIcon"
                  label={t('admin:components.setting.icon')}
                  value={socialLink.icon || ''}
                  onChange={(e) => handleUpdateSocialLinks(index, e.target.value, 'icon')}
                />

                <InputText
                  sx={{ flexGrow: 1 }}
                  name="socialLink"
                  label={t('admin:components.setting.link')}
                  value={socialLink.link || ''}
                  onChange={(e) => handleUpdateSocialLinks(index, e.target.value, 'link')}
                />

                <IconButton
                  title={t('admin:components.common.delete')}
                  className={styles.iconButton}
                  onClick={() => handleRemoveSocialLinks(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          <Button variant="contained" onClick={handleAddSocialLinks}>
            <AddIcon /> {t('admin:components.setting.addSocialLink')}
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <InputText
            name="title"
            label={t('admin:components.setting.title')}
            value={title || ''}
            onChange={(e) => setTitle(e.target.value)}
          />

          <InputText
            name="description"
            label={t('admin:components.setting.description')}
            value={siteDescription || ''}
            onChange={(e) => setSiteDescription(e.target.value)}
          />

          <InputText
            name="logo"
            label={t('admin:components.setting.logo')}
            value={logo || ''}
            onChange={(e) => setLogo(e.target.value)}
          />

          <InputText
            name="icon192px"
            label={t('admin:components.setting.icon192px')}
            value={icon192px || ''}
            onChange={(e) => setIcon192px(e.target.value)}
          />

          <InputText
            name="icon512px"
            label={t('admin:components.setting.icon512px')}
            value={icon512px || ''}
            onChange={(e) => setIcon512px(e.target.value)}
          />

          <InputText
            name="favIcon16px"
            label={t('admin:components.setting.favIcon16px')}
            value={favicon16px || ''}
            onChange={(e) => setFavicon16px(e.target.value)}
          />

          <InputText
            name="favIcon32px"
            label={t('admin:components.setting.favIcon32px')}
            value={favicon32px || ''}
            onChange={(e) => setFavicon32px(e.target.value)}
          />

          <InputText name="url" label={t('admin:components.setting.url')} value={clientSetting?.url || ''} disabled />

          <InputText
            name="releaseName"
            label={t('admin:components.setting.releaseName')}
            value={clientSetting?.releaseName || ''}
            disabled
          />
        </Grid>
      </Grid>
      <Button sx={{ maxWidth: '100%' }} className={styles.outlinedButton} onClick={handleCancel}>
        {t('admin:components.common.cancel')}
      </Button>
      <Button sx={{ maxWidth: '100%', ml: 1 }} className={styles.gradientButton} onClick={handleSubmit}>
        {t('admin:components.common.save')}
      </Button>
    </Box>
  )
}

export default Client
