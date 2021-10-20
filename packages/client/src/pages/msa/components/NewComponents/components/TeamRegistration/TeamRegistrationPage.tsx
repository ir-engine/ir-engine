import React from 'react'

import { makeStyles } from '@mui/styles'

import NavBar from '../Common/NavBar'
import TeamName from './TeamName'
import TeamImage from './TeamImage'
import Footer from '../Common/Footer'

const useStyles = makeStyles((theme: any) => ({
  backgroundImage: {
    backgroundImage: `url(/static/msa/assets/registerTeam-back.png)`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    height: '100vh',
    width: 'auto'
  }
}))

const TeamRegistrationPage = () => {
  const classes = useStyles()

  return (
    <>
      <div className={classes.backgroundImage}>
        <NavBar />
        <TeamName />
        <TeamImage />
        <Footer />
      </div>
    </>
  )
}

export default TeamRegistrationPage
