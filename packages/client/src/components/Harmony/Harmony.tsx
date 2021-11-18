import React from 'react'
import LeftHarmony from '@xrengine/client-core/src/harmony/components/leftHamony'
import RightHarmony from '@xrengine/client-core/src/harmony/components/rightHarmony'
import Grid from '@mui/material/Grid'
import MenuIcon from '@mui/icons-material/Menu'
import { useMediaQuery } from 'react-responsive'
import SideMenu from './SideMenu'
import IconButton from '@mui/material/IconButton'
import { useStyles } from './style'
import Index from '@xrengine/client-core/src/HarmonyRevamp/index'
import ModeContext from '@xrengine/client-core/src/HarmonyRevamp/context/modeContext'

export default function Harmony() {
  const [darkMode, setDarkMode] = React.useState(false)
  const classes = useStyles()
  const [openSideMenu, setOpenSIdeMenu] = React.useState(false)
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 768px)' })

  const openMenuModel = (open: boolean) => {
    setOpenSIdeMenu(open)
  }

  React.useEffect(() => {
    const mode = JSON.parse(localStorage.getItem('mode'))
    if (mode === null) {
      localStorage.setItem('mode', JSON.stringify(darkMode))
    } else {
      setDarkMode(mode)
    }
  }, [])

  React.useEffect(() => {
    if (!isTabletOrMobile) {
      setOpenSIdeMenu(isTabletOrMobile)
    }
    console.log('Local Storage', localStorage.getItem('mode'))
  }, [isTabletOrMobile])

  return (
    <div style={{ backgroundColor: '#15171B' }}>
      <ModeContext.Provider value={{ darkMode, setDarkMode }}>
        <Index />
      </ModeContext.Provider>
      {/* <Grid container spacing={0}>
        <Grid item xs={1} md={3}>
          {isTabletOrMobile ? (
            <IconButton onClick={() => openMenuModel(true)}>
              <MenuIcon className={classes.whiteIcon} />
            </IconButton>
          ) : (
            <LeftHarmony />
          )}
        </Grid>
        <Grid item xs={11} md={9}>
          <RightHarmony />
        </Grid>
      </Grid>
      <SideMenu open={openSideMenu} handleClose={openMenuModel} /> */}
    </div>
  )
}
