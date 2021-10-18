import ScenesConsole from '../components/Scenes'
import { AuthService } from '../../user/state/AuthService'
import React, { useEffect } from 'react'
import { useDispatch } from '../../store'

interface Props {}

function scenes(props: Props) {
  const dispatch = useDispatch()

  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])

  return <ScenesConsole />
}

export default scenes
