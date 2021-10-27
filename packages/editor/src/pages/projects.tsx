import ClickAwayListener from '@mui/material/ClickAwayListener'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import SignIn from '@xrengine/client-core/src/user/components/Auth/Login'
import ProfileMenu from '@xrengine/client-core/src/user/components/UserMenu/menus/ProfileMenu'
import { useTranslation } from 'react-i18next'
import { useAuthState } from '@xrengine/client-core/src/user/state/AuthService'
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

/**
 *Component to render the existing projects in grids with a grid to add new project.
 *@ProjectsPage
 */

const ProjectsPage = () => {
  const classes = useStyles()

  const [currentPage, setCurrentPage] = React.useState(0)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const authState = useAuthState()
  const authUser = authState.authUser // authUser initialized by getting property from authState object.

  const { t } = useTranslation()

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setCurrentPage(newValue)
  }

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
          <Tabs
            value={currentPage}
            onChange={handleChange}
            indicatorColor="primary"
            aria-label="scrollable auto tabs example"
            orientation="vertical"
            className={classes.tabs}
            classes={{ indicator: classes.indicator }}
          >
            <Tab
              label={t('editor.projects.projectHeader')}
              {...tapId(0)}
              sx={{
                '&.Mui-selected': {
                  color: 'inherit',
                  opacity: 1
                }
              }}
            />
            <Tab
              label={t('editor.projects.sceneHeader')}
              {...tapId(1)}
              sx={{
                '&.Mui-selected': {
                  color: 'inherit',
                  opacity: 1
                }
              }}
            />
          </Tabs>
          <TabPanel value={currentPage} index={0}>
            <Projects showingScenes={false} />
          </TabPanel>
          <TabPanel value={currentPage} index={1}>
            <Projects showingScenes={true} />
          </TabPanel>
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
