import Projects from '../components/Project/ProjectTable'
import { AuthService } from '../../user/services/AuthService'
import React, { useEffect } from 'react'

interface Props {}

function projectsRoute(props: Props) {
  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])
  return <Projects />
}

export default projectsRoute
