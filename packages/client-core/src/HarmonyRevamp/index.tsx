import * as React from 'react'
import { Container, Grid } from '@mui/material'
import { useHarmonyStyles } from './style'
import LeftHarmony from './LeftHarmony'
import MessageBox from './messageBox'
import RightHarmony from './RightHarmony'

// interface IndexProps {

// }

const Index = () => {
  const classes = useHarmonyStyles()

  return (
    <Grid container className={classes.root}>
      <Grid item xs={3} className={classes.rightGrid}>
        <Container>
          <LeftHarmony />
        </Container>
      </Grid>
      <Grid item xs={6}>
        <MessageBox />
      </Grid>
      <Grid item xs={3} className={classes.leftGrid}>
        <Container>
          <RightHarmony />
        </Container>
      </Grid>
    </Grid>
  )
}

export default Index
