import React from 'react'

import { makeStyles } from '@mui/styles'

import NavBar from '../Common/NavBar'
import MainContent from './MainContent'

const useStyles = makeStyles((theme: any) => ({
  backgroundImage: {
    // backgroundImage: `url(/static/msa/assets/initial-BG.png)`,
    backgroundImage: `url(/static/msa/assets/initial-peopleBG.png)`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center top',
    height: '100vh',
    width: '100%'
  }
}))

const InitialMainContentPage = () => {
  const classes = useStyles()

  return (
    <div className={classes.backgroundImage}>
      <NavBar />
      <MainContent />
    </div>
  )
}

export default InitialMainContentPage
