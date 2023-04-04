import React from 'react'

import { PopupMenuInline } from '@etherealengine/client-core/src/user/components/UserMenu/PopupMenuInline'

import { EditorNavbar } from '../components/projects/EditorNavbar'
import Projects from '../components/projects/ProjectsPage'

export const ProjectPage = () => {
  return (
    <>
      <EditorNavbar />
      <Projects />
    </>
  )
}
