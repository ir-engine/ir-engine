import React, { Fragment, useEffect, useState } from 'react'
import EmailIcon from '@mui/icons-material/Email'
import SocialIcon from '@mui/icons-material/Public'
import UserIcon from '@mui/icons-material/Person'
import { Config } from '@xrengine/common/src/config'
import MagicLinkEmail from './MagicLinkEmail'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import SocialLogin from './SocialLogin'
import PasswordLogin from './PasswordLogin'
import { useTranslation } from 'react-i18next'
import { AuthSettingService } from '../../../admin/services/Setting/AuthSettingService'
import { useAdminAuthSettingState } from '../../../admin/services/Setting/AuthSettingService'

const initialState = {
  jwt: true,
  local: false,
  facebook: false,
  github: false,
  google: false,
  linkedin: false,
  twitter: false,
  smsMagicLink: false,
  emailMagicLink: false
}

const TabPanel = (props: any): any => {
  const { children, value, index } = props

  return <Fragment>{value === index && children}</Fragment>
}

const SignIn = (): any => {
  const authSettingState = useAdminAuthSettingState()
  const [authSetting] = authSettingState?.authSettings?.value || []
  const [state, setState] = useState(initialState)

  useEffect(() => {
    !authSetting && AuthSettingService.fetchAuthSetting()
  }, [])

  useEffect(() => {
    if (authSetting) {
      let temp = { ...initialState }
      authSetting?.authStrategies?.forEach((el) => {
        Object.entries(el).forEach(([strategyName, strategy]) => {
          temp[strategyName] = strategy
        })
      })
      setState(temp)
    }
  }, [authSettingState?.updateNeeded?.value])

  let enableSmsMagicLink = true
  let enableEmailMagicLink = true
  let enableUserPassword = false
  let enableGithubSocial = false
  let enableGoogleSocial = false
  let enableFacebookSocial = false
  let enableLinkedInSocial = false
  let enableTwitterSocial = false

  const [tabIndex, setTabIndex] = useState(0)
  const { t } = useTranslation()

  const handleChange = (event: any, newValue: number): void => {
    event.preventDefault()
    setTabIndex(newValue)
  }

  if (Config.publicRuntimeConfig?.auth) {
    enableSmsMagicLink = state.smsMagicLink
    enableEmailMagicLink = state.emailMagicLink
    enableUserPassword = state.local
    enableGithubSocial = state.github
    enableGoogleSocial = state.google
    enableFacebookSocial = state.facebook
    enableLinkedInSocial = state.linkedin
    enableTwitterSocial = state.twitter
  }

  const socials = [
    enableGithubSocial,
    enableGoogleSocial,
    enableFacebookSocial,
    enableLinkedInSocial,
    enableTwitterSocial
  ]
  const enabled = [
    enableSmsMagicLink,
    enableEmailMagicLink,
    enableUserPassword,
    enableGithubSocial,
    enableGoogleSocial,
    enableFacebookSocial,
    enableLinkedInSocial,
    enableTwitterSocial
  ]

  const enabledCount = enabled.filter((v) => v).length
  const socialCount = socials.filter((v) => v).length

  let component = <MagicLinkEmail />
  if (enabledCount === 1) {
    if (enableSmsMagicLink) {
      component = <MagicLinkEmail />
    } else if (enableEmailMagicLink) {
      component = <MagicLinkEmail />
    } else if (enableUserPassword) {
      component = <PasswordLogin />
    } else if (socialCount > 0) {
      component = <SocialLogin />
    }
  } else {
    let index = 0
    const emailTab = (enableEmailMagicLink || enableSmsMagicLink) && (
      <Tab icon={<EmailIcon />} label={t('user:auth.login.email')} />
    )
    const emailTabPanel = (enableEmailMagicLink || enableSmsMagicLink) && (
      <TabPanel value={tabIndex} index={index}>
        <MagicLinkEmail />
      </TabPanel>
    )
    ;(enableEmailMagicLink || enableSmsMagicLink) && ++index

    const userTab = enableUserPassword && <Tab icon={<UserIcon />} label={t('user:auth.login.username')} />
    const userTabPanel = enableUserPassword && (
      <TabPanel value={tabIndex} index={index}>
        <PasswordLogin />
      </TabPanel>
    )
    enableUserPassword && ++index

    const socialTab = socialCount > 0 && <Tab icon={<SocialIcon />} label={t('user:auth.login.social')} />
    const socialTabPanel = socialCount > 0 && (
      <TabPanel value={tabIndex} index={index}>
        <SocialLogin
          enableFacebookSocial={enableFacebookSocial}
          enableGoogleSocial={enableGoogleSocial}
          enableGithubSocial={enableGithubSocial}
          enableLinkedInSocial={enableLinkedInSocial}
          enableTwitterSocial={enableTwitterSocial}
        />
      </TabPanel>
    )
    socialCount > 0 && ++index

    component = (
      <Fragment>
        {(enableUserPassword || socialCount > 0) && (
          <Tabs
            value={tabIndex}
            onChange={handleChange}
            variant="fullWidth"
            indicatorColor="secondary"
            textColor="secondary"
            aria-label="Login Configure"
          >
            {emailTab}
            {userTab}
            {socialTab}
          </Tabs>
        )}
        {emailTabPanel}
        {userTabPanel}
        {socialTabPanel}
      </Fragment>
    )
  }

  return component
}

export default SignIn
