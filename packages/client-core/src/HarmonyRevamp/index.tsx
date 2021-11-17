import * as React from 'react'
import { Container, Grid } from '@mui/material'
import { useHarmonyStyles } from './style'
import LeftHarmony from './LeftHarmony'
import MessageBox from './messageBox'
import RightHarmony from './RightHarmony'
import Empty from './empty'
import ModeContext from './context/modeContext'

// interface IndexProps {

// }

const Index = () => {
  const { darkMode } = React.useContext(ModeContext)
  const classes = useHarmonyStyles()

  return (
    <Grid container className={classes.root}>
      <Grid item xs={3} className={darkMode ? classes.GridDark : classes.GridLight}>
        <Container>
          <LeftHarmony />
        </Container>
      </Grid>
      <Grid item xs={6} className={!darkMode && classes.whiteBg}>
        <MessageBox />
        {/* <Empty /> */}
      </Grid>
      <Grid item xs={3} className={darkMode ? classes.GridDark : classes.GridLight}>
        <Container>
          <RightHarmony />
        </Container>
      </Grid>
    </Grid>
  )
}

export default Index
