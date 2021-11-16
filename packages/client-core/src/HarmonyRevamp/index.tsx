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
  const [showChat, setShowChat] = React.useState(false)
  return (
    <Grid container className={classes.root}>
      <Grid item xs={3} className={classes.rightGrid}>
        <Container style={{ height: '100%' }}>
          <LeftHarmony setShowChat={setShowChat} />
        </Container>
      </Grid>
      <Grid item xs={6}>
        {!showChat && <Empty />}
        {showChat && targetChannelId && <MessageBox />}
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
