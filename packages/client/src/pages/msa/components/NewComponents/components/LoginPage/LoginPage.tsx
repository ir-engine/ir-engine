import React from 'react'

import { makeStyles } from '@mui/styles'

import NavBar from '../Common/NavBar'
import LoginBtn from './LoginBtn'
import OtherLogins from './OtherLogins'
import Footer from '../Common/Footer'

const useStyles = makeStyles((theme: any) => ({
  backgroundImage: {
    backgroundImage: `url(/static/msa/assets/registerTeam-back.png)`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    height: '100vh',
    width: '100%'
  }
}))

const LoginPage = () => {
  const classes = useStyles()

  return (
    <>
      {/* <div className={styles.backgroundImage}> */}
      <div className={classes.backgroundImage}>
        <NavBar />
        <LoginBtn />
        <OtherLogins />
        <Footer />
      </div>
    </>
  )
}

export default LoginPage
