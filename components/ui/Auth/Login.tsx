import { Fragment, useState } from 'react'
import EmailIcon from '@material-ui/icons/Email'
import SocialIcon from '@material-ui/icons/Public'
import UserIcon from '@material-ui/icons/Person'
import getConfig from 'next/config'
import MagicLinkEmail from './MagicLinkEmail'
import { Tabs, Tab } from '@material-ui/core'
import './style.scss'
import SocialLogin from './SocialLogin'
import PasswordLogin from './PasswordLogin'

const config = getConfig().publicRuntimeConfig

const TabPanel = (props: any) => {
  const { children, value, index } = props

  return (
    <Fragment>
      {value === index && children}
    </Fragment>
  )
}

const SignIn = () => {
  let enableSmsMagicLink = true
  let enableEmailMagicLink = true
  let enableUserPassword = false
  let isEnabledGithub = false
  let isEnabledGoogle = false
  let isEnabledFacebook = false
  const [tabIndex, setTabIndex] = useState(0)

  const handleChange = (event: any, newValue: number) => {
    event.preventDefault()
    setTabIndex(newValue)
  }

  if (config && config.auth) {
    enableSmsMagicLink = config.auth.enableSmsMagicLink
    enableEmailMagicLink = config.auth.enableEmailMagicLink
    enableUserPassword = config.auth.enableUserPassword
    isEnabledGithub = config.auth.isEnabledGithub
    isEnabledGoogle = config.auth.isEnabledGoogle
    isEnabledFacebook = config.auth.isEnabledFacebook
  }

  const socials = [
    isEnabledGithub,
    isEnabledGoogle,
    isEnabledFacebook
  ]
  const enabled = [
    enableSmsMagicLink,
    enableEmailMagicLink,
    enableUserPassword,
    isEnabledGithub,
    isEnabledGoogle,
    isEnabledFacebook
  ]

  const enabledCount = enabled.filter(v => v).length
  const socialCount = socials.filter(v => v).length

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
    const emailTab = (enableEmailMagicLink || enableSmsMagicLink) && <Tab icon={<EmailIcon/>} label="Email | SMS"/>
    const emailTabPanel = (enableEmailMagicLink || enableSmsMagicLink) &&
      <TabPanel value={tabIndex} index={index}><MagicLinkEmail /></TabPanel>
    (enableEmailMagicLink || enableSmsMagicLink) && ++index

    const userTab = enableUserPassword && <Tab icon={<UserIcon/>} label="UserName + Password"/>
    const userTabPanel = enableUserPassword && <TabPanel value={tabIndex} index={index}><PasswordLogin/></TabPanel>
    enableUserPassword && ++index

    const socialTab = socialCount > 0 && <Tab icon={<SocialIcon/>} label="Social"/>
    const socialTabPanel = socialCount > 0 && <TabPanel value={tabIndex} index={index}><SocialLogin isEnabledFacebook={isEnabledFacebook} isEnabledGoogle={isEnabledGoogle} isEnabledGithub={isEnabledGithub} /></TabPanel>
    socialCount > 0 && ++index

    console.log(socialCount, socialTabPanel)

    component = (
      <Fragment>
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
        {emailTabPanel}
        {userTabPanel}
        {socialTabPanel}
      </Fragment>
    )
  }

  return component
}

export default SignIn
