import React, { useEffect } from 'react'

import { AuthService } from '../../user/services/AuthService'
import ScenesConsole from '../components/Scenes'

interface Props {}

function scenes(props: Props) {
  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])

  return <ScenesConsole />
}

export default scenes
