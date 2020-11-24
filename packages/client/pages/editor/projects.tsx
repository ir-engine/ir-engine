import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { withApi } from "../../components/editor/contexts/ApiContext";
import { Button, MediumButton } from "../../components/editor/inputs/Button";
import { connectMenu, ContextMenu, MenuItem } from "../../components/editor/layout/ContextMenu";
import { ErrorMessage, ProjectGrid, ProjectGridContainer, ProjectGridContent, ProjectGridHeader, ProjectGridHeaderRow } from "../../components/editor/projects/ProjectGrid";
import templates from "../../components/editor/projects/templates";
import Api from "../../components/editor/Api";
import { Router, withRouter } from "next/router";
import { ThemeContext } from "../../components/editor/theme";
import { connect } from 'react-redux';
import {selectAuthState} from "../../redux/auth/selector";
import {bindActionCreators, Dispatch} from "redux";
import {doLoginAuto} from "../../redux/auth/service";
export const ProjectsSection = (styled as any).section<{ flex?: number }>`
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
const WelcomeContainer = styled(ProjectsContainer)`
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
type Props = {
  api: Api;
  history: object;
  router: Router;
  authState?: any;
  doLoginAuto?: any;
};
type ProjectsPageState = { projects: any } & {
  error: any;
  loading: boolean;
} & ((error: any) => any) & {
    projects: any[];
    loading: any;
    isAuthenticated: any;
    error: null;
    authUser: any;
    user: any;
  };
const mapStateToProps = (state: any): any => {
  return {
    authState: selectAuthState(state),
  };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  doLoginAuto: bindActionCreators(doLoginAuto, dispatch)
});
const ProjectsPage = (props: Props) => {
  const {
    api,
    history,
    router,
    authState,
    doLoginAuto
  } = props;


  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const isAuthenticated = api.isAuthenticated();
  const [error, setError] = useState(null);
  const authUser = authState.get('authUser');
  const user = authState.get('user');
  useEffect(() => {
    doLoginAuto(true);
    console.warn("PROJECTS PAGE PROPS: ", props);
    console.log(authState);
    // We dont need to load projects if the user isn't logged in

  }, []);

  useEffect(() => {
    if (authUser?.accessToken != null && authUser.accessToken.length > 0 && user?.id != null) {
      api.getProjects()
          .then(projects => {
            setProjects(projects.map(project => ({
              ...project,
              url: `/editor/projects/${project.project_id}`
            })));
            setLoading(false);
          })
          .catch(error => {
            console.error(error);
            if (error.response && error.response.status === 401) {
              // User has an invalid auth token. Prompt them to login again.
              // return (this.props as any).history.push("/", { from: "/projects" });
              return router.push("/editor/projects");
            }
            setError(error);
            setLoading(false);
          });
    }
  }, [authUser, user]);

  const contextType = ThemeContext;

  const onDeleteProject = async (project) => {
    try {
      await api.deleteProject(project.project_id);
      setProjects(projects.filter(
          (p) => p.project_id !== project.project_id
      ));
    } catch (error) {
      console.log('Delete project error');
    }
  };
  const routeTo = (route: string) => () => {
    router.push(route);
  };
  const renderContextMenu = props => {
    return (
      <>
      <ContextMenu id={contextMenuId}>
        <MenuItem onClick={e => onDeleteProject(props.trigger.project)}>
          Delete Project
        </MenuItem>
      </ContextMenu>
      </>
    );
  };
  const ProjectContextMenu = connectMenu(contextMenuId)(renderContextMenu);

  const topTemplates = [];
  for (let i = 0; i < templates.length && i < 4; i++) {
    topTemplates.push(templates[i]);
  }
  return (
      <>
        { authUser?.accessToken != null && authUser.accessToken.length > 0 && user?.id != null && <main>
          {(projects.length === 0 && !loading) ? (
              <ProjectsSection flex={0}>
                <WelcomeContainer>
                  <h1>Welcome</h1>
                  <h2>
                    If you&#39;re new here we recommend going through the
                    tutorial. Otherwise, jump right in and create a project from
                    scratch or from one of our templates.
                  </h2>
                  <MediumButton onClick={routeTo("/editor/tutorial")}>
                    Start Tutorial
                  </MediumButton>
                </WelcomeContainer>
              </ProjectsSection>
          ) : null}
          <ProjectsSection>
            <ProjectsContainer>
              <ProjectsHeader>
                <h1>Projects</h1>
              </ProjectsHeader>
              <ProjectGridContainer>
                <ProjectGridHeader>
                  <ProjectGridHeaderRow />
                  <ProjectGridHeaderRow>
                    <Button onClick={routeTo("/editor/create")}>
                      New Project
                    </Button>
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
                          newProjectLabel="New Project"
                          contextMenuId={contextMenuId}
                      />
                  )}
                </ProjectGridContent>
              </ProjectGridContainer>
            </ProjectsContainer>
          </ProjectsSection>
          <ProjectContextMenu />
        </main> }
      </>
    );
};

export default withRouter(withApi(connect(mapStateToProps,mapDispatchToProps)(ProjectsPage)));
