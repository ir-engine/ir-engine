import ClickAwayListener from '@mui/material/ClickAwayListener'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import SignIn from '@xrengine/client-core/src/user/components/Auth/Login'
import ProfileMenu from '@xrengine/client-core/src/user/components/UserMenu/menus/ProfileMenu'
import { useTranslation } from 'react-i18next'
import { useAuthState } from '@xrengine/client-core/src/user/state/AuthState'
import React, { useState } from 'react'
import {
  ProfileButton,
  StyledProjectsContainer,
  StyledProjectsHeader,
  StyledProjectsSection,
  TabPanel,
  tapId,
  useStyles
} from './projectUtility'
import Projects from '../components/projects/ProjectsPage'
import { Person } from '@mui/icons-material'
import {
  ProjectGridContainer,
  ProjectGridContent,
  ProjectGridHeader,
  ProjectGridHeaderRow
} from '../components/projects/ProjectGrid'
import { ProjectInterface } from '@xrengine/common/src/interfaces/ProjectInterface'

/**
 *Component to render the existing projects in grids with a grid to add new project.
 *@ProjectsPage
 */

const ProjectsPage = () => {
  const classes = useStyles()

  const [currentProject, setCurrentProject] = useState<ProjectInterface>(null)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const authState = useAuthState()
  const authUser = authState.authUser // authUser initialized by getting property from authState object.

  const { t } = useTranslation()

  /**
   * Rendering view for projects page, if user is not login yet then showing login view.
   * if user is loged in and has no existing projects then we showing welcome view, providing link for the tutorials.
   * if user has existing projects then we show the existing projects in grids and a grid to add new project.
   *
   */
  return (
    <>
      {!authUser ? (
        <StyledProjectsSection>
          <StyledProjectsContainer>
            <StyledProjectsHeader>
              <h1>{t('editor.projects.header')}</h1>
            </StyledProjectsHeader>
            <ProjectGridContainer>
              <ProjectGridContent>
                <SignIn />
              </ProjectGridContent>
            </ProjectGridContainer>
          </StyledProjectsContainer>
        </StyledProjectsSection>
      ) : (
        <ProjectGridHeader>
          <ProjectGridHeaderRow />
          <ProjectGridHeaderRow>
            <ProfileButton onClick={() => setProfileMenuOpen(true)}>
              <Person />
            </ProfileButton>
          </ProjectGridHeaderRow>
        </ProjectGridHeader>
      )}
      {authUser && (
        <div className={classes.root}>
          <Projects setCurrentProject={setCurrentProject} currentProject={currentProject} />
        </div>
      )}
      {profileMenuOpen && (
        <ClickAwayListener onClickAway={() => setProfileMenuOpen(false)}>
          {/* <div className={styles.profileMenu}> */}
          <div className={'profileMenu'}>
            <ProfileMenu setProfileMenuOpen={setProfileMenuOpen} />
          </div>
        </ClickAwayListener>
      )}
    </>
  )
}

export default ProjectsPage
