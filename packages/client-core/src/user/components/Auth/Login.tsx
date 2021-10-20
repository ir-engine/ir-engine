import React, { Fragment, useState } from 'react'
import EmailIcon from '@material-ui/icons/Email'
import SocialIcon from '@material-ui/icons/Public'
import UserIcon from '@material-ui/icons/Person'
import { Config } from '@standardcreative/common/src/config'
import MagicLinkEmail from './MagicLinkEmail'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import SocialLogin from './SocialLogin'
import PasswordLogin from './PasswordLogin'
import { useTranslation } from 'react-i18next'

const TabPanel = (props: any): any => {
  const { children, value, index } = props

  return <Fragment>{value === index && children}</Fragment>
}

const SignIn = (): any => {
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
    enableSmsMagicLink = Config.publicRuntimeConfig.auth.enableSmsMagicLink
    enableEmailMagicLink = Config.publicRuntimeConfig.auth.enableEmailMagicLink
    enableUserPassword = Config.publicRuntimeConfig.auth.enableUserPassword
    enableGithubSocial = Config.publicRuntimeConfig.auth.enableGithubSocial
    enableGoogleSocial = Config.publicRuntimeConfig.auth.enableGoogleSocial
    enableFacebookSocial = Config.publicRuntimeConfig.auth.enableFacebookSocial
    enableLinkedInSocial = Config.publicRuntimeConfig.auth.enableLinkedInSocial
    enableTwitterSocial = Config.publicRuntimeConfig.auth.enableTwitterSocial
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
