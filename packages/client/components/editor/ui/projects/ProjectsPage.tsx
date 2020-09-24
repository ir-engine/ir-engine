import React, { Component } from "react";
import PropTypes from "prop-types";
import configs from "../../configs";
import { withApi } from "../contexts/ApiContext";
import {
  ProjectGrid,
  ProjectGridContainer,
  ProjectGridHeader,
  ProjectGridHeaderRow,
  ProjectGridContent,
  ErrorMessage
} from "./ProjectGrid";
import { Button } from "../inputs/Button";

import { MediumButton } from "../inputs/Button";
// import Link from "next/link";
import { connectMenu, ContextMenu, MenuItem } from "../layout/ContextMenu";
import templates from "./templates";
import styled from "styled-components";

export const ProjectsSection = (styled as any).section`
  padding-bottom: 100px;
  display: flex;
  flex: ${props => (props.flex === undefined ? 1 : props.flex)};

  &:first-child {
    padding-top: 100px;
  }

  h1 {
    font-size: 36px;
  }

  h2 {
    font-size: 16px;
  }
`;

export const ProjectsContainer = (styled as any).div`
  display: flex;
  flex: 1;
  flex-direction: column;
  margin: 0 auto;
  max-width: 1200px;
  padding: 0 20px;
`;

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
`;

export const ProjectsHeader = (styled as any).div`
  margin-bottom: 36px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const contextMenuId = "project-menu";

class ProjectsPage extends Component {
  static propTypes = {
    api: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);

    const isAuthenticated = (this.props as any).api.isAuthenticated();

    this.state = {
      projects: [],
      loading: isAuthenticated,
      isAuthenticated,
      error: null
    };
  }

  componentDidMount() {
    // We dont need to load projects if the user isn't logged in
    if ((this.state as any).isAuthenticated) {
      (this.props as any).api
        .getProjects()
        .then(projects => {
          this.setState({
            projects: projects.map(project => ({
              ...project,
              url: `/projects/${project.project_id}`
            })),
            loading: false
          });
        })
        .catch(error => {
          console.error(error);

          if (error.response && error.response.status === 401) {
            // User has an invalid auth token. Prompt them to login again.
            return (this.props as any).history.push("/", { from: "/projects" });
          }

          this.setState({ error, loading: false });
        });
    }
  }

  onDeleteProject = project => {
    (this.props as any).api
      .deleteProject(project.project_id)
      .then(() => this.setState({ projects: (this.state as any).projects.filter(p => p.project_id !== project.project_id) }))
      .catch(error => this.setState({ error }));
  };

  renderContextMenu = props => {
    return (
      /* @ts-ignore */
      <ContextMenu id={contextMenuId}>
        { /* @ts-ignore */ }
        <MenuItem onClick={e => this.onDeleteProject(props.trigger.project, e)}>Delete Project</MenuItem>
      </ContextMenu>
    );
  };

  ProjectContextMenu = connectMenu(contextMenuId)(this.renderContextMenu);

  render() {
    const { error, loading, projects, isAuthenticated } = this.state as any;

    const ProjectContextMenu = this.ProjectContextMenu;

    const topTemplates = [];

    for (let i = 0; i < templates.length && i < 4; i++) {
      topTemplates.push(templates[i]);
    }

    return (
      <>
        <main>
          {!isAuthenticated || (projects.length === 0 && !loading) ? (
            <ProjectsSection flex={0}>
              <WelcomeContainer>
                <h1>Welcome</h1>
                <h2>
                  If you&#39;re new here we recommend going through the tutorial. Otherwise, jump right in and create a
                  project from scratch or from one of our templates.
                </h2>
                <MediumButton as="a" href="/projects/tutorial">
                  Start Tutorial
                </MediumButton>
              </WelcomeContainer>
            </ProjectsSection>
          ) : null
          }
          <ProjectsSection>
            <ProjectsContainer>
              <ProjectsHeader>
                <h1>Projects</h1>
              </ProjectsHeader>
              <ProjectGridContainer>
                <ProjectGridHeader>
                  <ProjectGridHeaderRow />
                  <ProjectGridHeaderRow>
                    <Button as="a" href="/projects/create">
                      New Project
                    </Button>
                  </ProjectGridHeaderRow>
                </ProjectGridHeader>
                <ProjectGridContent>
                  {error && <ErrorMessage>{error.message}</ErrorMessage>}
                  {!error && (
                    <ProjectGrid
                      loading={loading}
                      projects={projects}
                      newProjectPath="/projects/templates"
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
    );
  }
}

export default withApi(ProjectsPage);
