import React, { Fragment } from 'react';
import EmailIcon from '@material-ui/icons/Email';
import SocialIcon from '@material-ui/icons/Public';
import UserIcon from '@material-ui/icons/Person';
import getConfig from 'next/config'
import MagicLinkEmail from './MagicLinkEmail';
import { Tabs, Tab } from '@material-ui/core';
import './auth.scss'
import SocialLogin from './SocialLogin';
import PasswordLogin from './PasswordLogin';

const config = getConfig().publicRuntimeConfig;

function TabPanel(props: any) {
  const { children, value, index } = props;

  return (
    <Fragment>
      {value === index && children}
    </Fragment>
  );
}

export default function SignIn(/* props: any */) {
  // const isEnableEmailMagicLink = (config ? config.isEnableEmailMagicLink : true);
  let isEnableSmsMagicLink = true;
  let isEnableEmailMagicLink = true;
  let isEnableUserPassword = false;
  let isEnableGithub = false;
  let isEnableGoogle = false;
  let isEnableFacebook = false;
  const [tabIndex, setTabIndex] = React.useState(0);

  const handleChange = (event: any, newValue: number) => {
    event.preventDefault();
    setTabIndex(newValue);
  };

  if (config && config.auth) {
      isEnableSmsMagicLink = config.auth.isEnableSmsMagicLink;
      isEnableEmailMagicLink = config.auth.isEnableEmailMagicLink;
      isEnableUserPassword = config.auth.isEnableUserPassword;
      isEnableGithub = config.auth.isEnableGithub;
      isEnableGoogle = config.auth.isEnableGoogle;
      isEnableFacebook = config.auth.isEnableFacebook;
  }

  const socials = [
    isEnableGithub, 
    isEnableGoogle, 
    isEnableFacebook
  ];
  const enabled = [
    isEnableSmsMagicLink,
    isEnableEmailMagicLink,
    isEnableUserPassword,
    isEnableGithub,
    isEnableGoogle,
    isEnableFacebook,
  ];

  const enabled_count = enabled.filter(v => v).length;
  const social_count = socials.filter(v => v).length;

  let component = <MagicLinkEmail></MagicLinkEmail>;
  if (enabled_count == 1) {
    if (isEnableSmsMagicLink) {
      component = <MagicLinkEmail></MagicLinkEmail>;
    }
    else if (isEnableEmailMagicLink) {
      component = <MagicLinkEmail></MagicLinkEmail>;
    }
    else if (isEnableUserPassword) {
      component = <PasswordLogin></PasswordLogin>
    }
    else if (social_count > 0) {
      component = <SocialLogin></SocialLogin>
    }
  }
  else {
    let index = 0;
    const emailTab      = (isEnableEmailMagicLink || isEnableSmsMagicLink) && <Tab icon={<EmailIcon/>} label="Email | SMS"/>
    const emailTabPanel = (isEnableEmailMagicLink || isEnableSmsMagicLink) && <TabPanel value={tabIndex} index={index}><MagicLinkEmail/></TabPanel>
    ;(isEnableEmailMagicLink || isEnableSmsMagicLink) && ++index;
    
    const userTab       = isEnableUserPassword && <Tab icon={<UserIcon/>} label="UserName + Password"/>
    const userTabPanel  = isEnableUserPassword && <TabPanel value={tabIndex} index={index}><PasswordLogin/></TabPanel>
    isEnableUserPassword && ++index;

    const socialTab       = social_count > 0 && <Tab icon={<SocialIcon/>} label="Social"/>
    const socialTabPanel  = social_count > 0 && <TabPanel value={tabIndex} index={index}><SocialLogin isEnableFacebook={isEnableFacebook} isEnableGoogle={isEnableGoogle} isEnableGithub={isEnableGithub}/></TabPanel>
    social_count > 0 && ++index;
    
    console.log(social_count, socialTabPanel);
    
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

  return component;
}
