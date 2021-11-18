import * as React from 'react'
import { Container, Grid } from '@mui/material'
import { useHarmonyStyles } from './style'
import LeftHarmony from './LeftHarmony/LeftHarmony'
import MessageBox from './Message/messageBox'
import RightHarmony from './RightHarmony/RightHarmony'
import Empty from './Message/empty'
import { useChatState } from '@xrengine/client-core/src/social/services/ChatService'
import ModeContext from './context/modeContext'

const Index = () => {
  const { darkMode } = React.useContext(ModeContext)
  const classes = useHarmonyStyles()
  const chatState = useChatState()
  const targetChannelId = chatState.targetChannelId.value
  const [showChat, setShowChat] = React.useState(false)

  return (
    <Grid container className={classes.root}>
      <Grid item xs={3} className={darkMode ? classes.GridDark : classes.GridLight}>
        <Container style={{ height: '100%' }}>
          <LeftHarmony setShowChat={setShowChat} />
        </Container>
      </Grid>
      <Grid item xs={6} className={!darkMode && classes.whiteBg}>
        {!showChat && <Empty />}
        {showChat && targetChannelId && <MessageBox />}
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
