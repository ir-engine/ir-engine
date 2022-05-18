import ScenesConsole from '../components/Scenes'
import { AuthService } from '../../user/services/AuthService'
import React, { useEffect } from 'react'

interface Props {}

function scenes(props: Props) {
  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])

  return <ScenesConsole />
}

export default scenes
