import * as React from 'react'
import { Container, Grid } from '@mui/material'
import { useHarmonyStyles } from './style'
import LeftHarmony from './LeftHarmony'
import MessageBox from './messageBox'
import RightHarmony from './RightHarmony'
import Empty from './empty'
import { useChatState } from '@xrengine/client-core/src/social/services/ChatService'

// interface IndexProps {

// }

const Index = () => {
  const classes = useHarmonyStyles()
  const chatState = useChatState()
  const targetChannelId = chatState.targetChannelId.value
  return (
    <Grid container className={classes.root}>
      <Grid item xs={3} className={classes.rightGrid}>
        <Container>
          <LeftHarmony />
        </Container>
      </Grid>
      <Grid item xs={6}>
        {/* <MessageBox /> */}
        {!targetChannelId && <Empty />}
        {targetChannelId && <MessageBox />}
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
