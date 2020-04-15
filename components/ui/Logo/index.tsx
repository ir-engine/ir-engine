import LogoImage from '../../assets/logo.png'
import React from 'react'
import './style.scss'

// TODO: Make responsive, when phone screen in portrait just show bubble, no xrchat text

const Logo: React.FunctionComponent = () => {
  return <img src={LogoImage} alt="logo" />
}

export default Logo
