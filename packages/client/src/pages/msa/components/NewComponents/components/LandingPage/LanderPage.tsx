import React from 'react'

import { makeStyles } from '@mui/styles'

import NavBar from './NavBar'
import Header from './Header'
import ManageTeam from './ManageTeam'
import Tokenomics from './Tokenomics'
import Roadmap from './Roadmap'
import OurTeam from './OurTeam'
import Footer from './Footer'

const useStyles = makeStyles((theme: any) => ({
  background: {
    backgroundImage: `url("/static/msa/assets/hero-back.svg")`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    height: 'auto',
    width: '100%'
  }
}))

const LanderPage = () => {
  const classes = useStyles()

  return (
    <>
      <div className={classes.background} id="top">
        <NavBar />
        <Header />
      </div>
      <ManageTeam />
      <Tokenomics />
      <Roadmap />
      <OurTeam />
      <Footer />
    </>
  )
}

export default LanderPage
