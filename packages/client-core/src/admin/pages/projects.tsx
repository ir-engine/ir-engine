import Projects from '../components/Project/Project'
import { AuthService } from '../../user/state/AuthService'
import React, { useEffect } from 'react'

interface Props {}

function projectsRoute(props: Props) {
  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])
  return <Projects />
}

export default projectsRoute
