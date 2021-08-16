import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import { Person } from '@material-ui/icons'
import SignIn from '@xrengine/client-core/src/user/components/Auth/Login'
import ProfileMenu from '@xrengine/client-core/src/user/components/UserMenu/menus/ProfileMenu'
import { selectAuthState } from '@xrengine/client-core/src/user/reducers/auth/selector'
import { doLoginAuto, logoutUser } from '@xrengine/client-core/src/user/reducers/auth/service'
import Api from '@xrengine/client-core/src/world/components/editor/Api'
import { withApi } from '@xrengine/client-core/src/world/components/editor/contexts/ApiContext'
import { Button, MediumButton } from '@xrengine/client-core/src/world/components/editor/inputs/Button'
import {
  connectMenu,
  ContextMenu,
  MenuItem
} from '@xrengine/client-core/src/world/components/editor/layout/ContextMenu'
import {
  ErrorMessage,
  ProjectGrid,
  ProjectGridContainer,
  ProjectGridContent,
  ProjectGridHeader,
  ProjectGridHeaderRow
} from '@xrengine/client-core/src/world/components/editor/projects/ProjectGrid'
import templates from '@xrengine/client-core/src/world/components/editor/projects/templates'
import { useHistory } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import LocationAdmin from '@xrengine/client-core/src/admin/components/Location'
import {
  TabPanel,
  tapId,
  useStyles,
  ProjectsContainer,
  ProjectsHeader,
  WelcomeContainer,
  ProjectsSection,
  ProfileButton
} from './projectUtility'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'

/**
 *Defining contextMenuId for rendering menus.
 *@contextMenuId
 *
 */
const contextMenuId = 'project-menu'

/**
 *Declairing Props component.
 * @api is of type {Api} EventEmitter.
 * @history is of type object.
 * @router is of type Router
 */
type Props = {
  api: Api
  history: object
  authState?: any
  doLoginAuto?: any
  logoutUser?: typeof logoutUser
}

/**
 * function to get authState.
 * @mapStateToProps
 */

const mapStateToProps = (state: any): any => {
  return {
    authState: selectAuthState(state)
  }
}

/**
 *function to bind auto login and user.
 *@mapDispatchToProps
 *
 */

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  doLoginAuto: bindActionCreators(doLoginAuto, dispatch),
  logoutUser: bindActionCreators(logoutUser, dispatch)
})

/**
 *Component to render the existing projects in grids with a grid to add new project.
 *@ProjectsPage
 */
const ProjectsPage = (props: Props) => {
  // creating types using props.
  const { api, authState, doLoginAuto, logoutUser } = props

  const router = useHistory()
  const classes = useStyles()

  const [value, setValue] = React.useState(0)
  const [projects, setProjects] = useState([]) // constant projects initialized with an empty array.
  const [loading, setLoading] = useState(false) // constant loading initialized with false.
  const isAuthenticated = api.isAuthenticated() // intialized with value returning from api.isAuthenticated()
  const [error, setError] = useState(null) // constant error initialized with null.
  const [profileMenuOpen, setProfileMenuOpen] = useState(false) // constant profileMenuOpen initialized as false
  const authUser = authState.get('authUser') // authUser initialized by getting property from authState object.
  const user = authState.get('user') // user initialized by getting value from authState object.
  const { t } = useTranslation()

  useEffect(() => {
    doLoginAuto(true)
    console.warn('PROJECTS PAGE PROPS: ', props)
    console.log(authState)
    // We dont need to load projects if the user isn't logged in
  }, [])

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue)
  }

  useEffect(() => {
    if (authUser?.accessToken != null && authUser.accessToken.length > 0 && user?.id != null) {
      api
        .getProjects()
        .then((projects) => {
          setProjects(
            projects.map((project) => ({
              ...project,
              url: `/editor/projects/${project.project_id}`
            }))
          )
          setLoading(false)
        })
        .catch((error) => {
          console.error(error)
          if (error.response && error.response.status === 401) {
            // User has an invalid auth token. Prompt them to login again.
            // return (this.props as any).history.push("/", { from: "/projects" });
            return router.push('/editor/projects')
          }
          setError(error)
          setLoading(false)
        })
    }
  }, [authUser, user])

  /**
   *function to delete project
   */
  const onDeleteProject = async (project) => {
    try {
      // calling api to delete project on the basis of project_id.
      await api.deleteProject(project.project_id)

      // setting projects after removing deleted project.
      setProjects(projects.filter((p) => p.project_id !== project.project_id))
    } catch (error) {
      console.log('Delete project error')
    }
  }

  /**
   *function to adding a route to the router object.
   */
  const routeTo = (route: string) => () => {
    router.push(route)
  }

  /**
   *function to render the ContextMenu component with MenuItem component delete.
   */
  const renderContextMenu = (props) => {
    return (
      <>
        <ContextMenu id={contextMenuId}>
          <MenuItem onClick={(e) => onDeleteProject(props.trigger.project)}>
            {t('editor.projects.contextMenu.deleteProject')}
          </MenuItem>
        </ContextMenu>
      </>
    )
  }

  /**
   *Calling a functional component connectMenu for creating ProjectContextMenu.
   *
   */
  const ProjectContextMenu = connectMenu(contextMenuId)(renderContextMenu)

  // Declairing an array
  const topTemplates = []

  // Adding first four templates of tamplates array to topTemplate array.
  for (let i = 0; i < templates.length && i < 4; i++) {
    topTemplates.push(templates[i])
  }

  const openProfileMenu = (): void => setProfileMenuOpen(true)

  /**
   * Rendering view for projects page, if user is not login yet then showing login view.
   * if user is loged in and has no existing projects then we showing welcome view, providing link for the tutorials.
   * if user has existing projects then we show the existing projects in grids and a grid to add new project.
   *
   */
  return (
    <>
      {!isAuthenticated || !authUser ? (
        <ProjectsSection>
          <ProjectsContainer>
            <ProjectsHeader>
              <h1>{t('editor.projects.header')}</h1>
            </ProjectsHeader>
            <ProjectGridContainer>
              <ProjectGridContent>
                <SignIn />
              </ProjectGridContent>
            </ProjectGridContainer>
          </ProjectsContainer>
        </ProjectsSection>
      ) : (
        <ProjectGridHeader>
          <ProjectGridHeaderRow />
          <ProjectGridHeaderRow>
            <ProfileButton onClick={() => openProfileMenu()}>
              <Person />
            </ProfileButton>
          </ProjectGridHeaderRow>
        </ProjectGridHeader>
      )}

      <div className={classes.root}>
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          aria-label="scrollable auto tabs example"
          orientation="vertical"
          className={classes.tabs}
          classes={{ indicator: classes.indicator }}
        >
          <Tab label={t('editor.projects.projectHeader')} {...tapId(0)} />
          <Tab label={t('editor.projects.locationHeader')} {...tapId(1)} />
        </Tabs>
        <TabPanel value={value} index={0}>
          {authUser?.accessToken != null && authUser.accessToken.length > 0 && user?.id != null && (
            <main>
              {projects.length === 0 && !loading ? (
                <ProjectsSection flex={0}>
                  <WelcomeContainer>
                    <h1>{t('editor.projects.welcomeMsg')}</h1>
                    <h2>{t('editor.projects.description')}</h2>
                    <MediumButton onClick={routeTo('/editor/tutorial')}>
                      {t('editor.projects.lbl-startTutorial')}
                    </MediumButton>
                  </WelcomeContainer>
                </ProjectsSection>
              ) : null}
              <ProjectsSection>
                <ProjectsContainer>
                  <ProjectGridContainer>
                    <ProjectGridHeader>
                      <ProjectGridHeaderRow />
                      <ProjectGridHeaderRow>
                        <Button onClick={routeTo('/editor/create')}>{t('editor.projects.lbl-newProject')}</Button>
                      </ProjectGridHeaderRow>
                    </ProjectGridHeader>
                    <ProjectGridContent>
                      {error && <ErrorMessage>{(error as any).message}</ErrorMessage>}
                      {!error && (
                        <ProjectGrid
                          loading={loading}
                          projects={projects}
                          // newProjectPath="/editor/templates"
                          newProjectPath="/editor/create"
                          newProjectLabel={t('editor.projects.lbl-newProject')}
                          contextMenuId={contextMenuId}
                        />
                      )}
                    </ProjectGridContent>
                  </ProjectGridContainer>
                </ProjectsContainer>
              </ProjectsSection>
              <ProjectContextMenu />
            </main>
          )}
        </TabPanel>
        <TabPanel value={value} index={1}>
          <ProjectsSection>
            <ProjectsContainer>
              <LocationAdmin />
            </ProjectsContainer>
          </ProjectsSection>
        </TabPanel>
      </div>

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

export default withApi(connect(mapStateToProps, mapDispatchToProps)(ProjectsPage))
