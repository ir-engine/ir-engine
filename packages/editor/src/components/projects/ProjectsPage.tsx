import React, { Component } from 'react'
import { withTranslation } from 'react-i18next'
import styled from 'styled-components'
import { deleteProject, getProjects } from '../../functions/projectFunctions'
import { Button, MediumButton } from '../inputs/Button'
import { connectMenu, ContextMenu, MenuItem } from '../layout/ContextMenu'

import {
  ErrorMessage,
  ProjectGrid,
  ProjectGridContainer,
  ProjectGridContent,
  ProjectGridHeader,
  ProjectGridHeaderRow
} from './ProjectGrid'
import templates from './templates'

/**
 *
 * @author Robert Long
 */
export const ProjectsSection = (styled as any).section`
  padding-bottom: 100px;
  display: flex;
  flex: ${(props) => (props.flex === undefined ? 1 : props.flex)};

  &:first-child {
    padding-top: 100px;
  }

  h1 {
    font-size: 36px;
  }

  h2 {
    font-size: 16px;
  }
`

/**
 *
 * @author Robert Long
 */
export const ProjectsContainer = (styled as any).div`
  display: flex;
  flex: 1;
  flex-direction: column;
  margin: 0 auto;
  max-width: 1200px;
  padding: 0 20px;
`

/**
 *
 * @author Robert Long
 */
const WelcomeContainer = (styled as any)(ProjectsContainer)`
  align-items: center;

  & > * {
    text-align: center;
  }

  & > *:not(:first-child) {
    margin-top: 20px;
  }

  h2 {
    max-width: 480px;
  }
`

/**
 *
 * @author Robert Long
 */
export const ProjectsHeader = (styled as any).div`
  margin-bottom: 36px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const contextMenuId = 'project-menu'

/**
 *
 * @author Robert Long
 */
class ProjectsPage extends Component<{ t: Function; history: any }> {
  constructor(props) {
    super(props)

    this.state = {
      projects: [],
      loading: true,
      error: null
    }
  }

  componentDidMount() {
    // We dont need to load projects if the user isn't logged in
    getProjects()
      .then((projects) => {
        this.setState({
          projects: projects.map((project) => ({
            ...project,
            url: `/editor/projects/${project.project_id}`
          })),
          loading: false
        })
      })
      .catch((error) => {
        console.error(error)

        if (error.response && error.response.status === 401) {
          // User has an invalid auth token. Prompt them to login again.
          return (this.props as any).history.push('/', { from: '/editor/projects' })
        }

        this.setState({ error, loading: false })
      })
  }

  onDeleteProject = (project) => {
    deleteProject(project.project_id)
      .then(() =>
        this.setState({ projects: (this.state as any).projects.filter((p) => p.project_id !== project.project_id) })
      )
      .catch((error) => this.setState({ error }))
  }

  renderContextMenu = (props) => {
    return (
      <ContextMenu id={contextMenuId}>
        <MenuItem onClick={() => this.onDeleteProject(props.trigger.project)}>Delete Project</MenuItem>
      </ContextMenu>
    )
  }

  ProjectContextMenu = connectMenu(contextMenuId)(this.renderContextMenu)

  render() {
    const { error, loading, projects, isAuthenticated } = this.state as any

    const ProjectContextMenu = this.ProjectContextMenu

    const topTemplates = []

    for (let i = 0; i < templates.length && i < 4; i++) {
      topTemplates.push(templates[i])
    }

    return (
      <>
        <main>
          {!isAuthenticated || (projects.length === 0 && !loading) ? (
            <ProjectsSection flex={0}>
              <WelcomeContainer>
                <h1>{this.props.t('editor:projects.page.header')}</h1>
                <h2>{this.props.t('editor:projects.page.headerMsg')}</h2>
                <MediumButton as="a" href="/projects/tutorial">
                  {this.props.t('editor:projects.page.lbl-startTutorial')}
                </MediumButton>
              </WelcomeContainer>
            </ProjectsSection>
          ) : null}
          <ProjectsSection>
            <ProjectsContainer>
              <ProjectsHeader>
                <h1>{this.props.t('editor:projects.page.projects')}</h1>
              </ProjectsHeader>
              <ProjectGridContainer>
                <ProjectGridHeader>
                  <ProjectGridHeaderRow />
                  <ProjectGridHeaderRow>
                    <Button as="a" href="/editor/create">
                      {this.props.t('editor:projects.page.lbl-newProject')}
                    </Button>
                  </ProjectGridHeaderRow>
                </ProjectGridHeader>
                <ProjectGridContent>
                  {error && <ErrorMessage>{error.message}</ErrorMessage>}
                  {!error && (
                    <ProjectGrid
                      loading={loading}
                      projects={projects}
                      newProjectPath="/editor/projects/templates"
                      contextMenuId={contextMenuId}
                    />
                  )}
                </ProjectGridContent>
              </ProjectGridContainer>
            </ProjectsContainer>
          </ProjectsSection>
          <ProjectContextMenu />
        </main>
      </>
    )
  }
}

export default withTranslation()(ProjectsPage)
