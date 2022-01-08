import React, { useEffect } from 'react'

import { AuthService } from '../../user/services/AuthService'
import Projects from '../components/Project/ProjectTable'

interface Props {}

function projectsRoute(props: Props) {
  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])
  return <Projects />
}

export default projectsRoute
