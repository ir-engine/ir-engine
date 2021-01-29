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
import {doLoginAuto, logoutUser} from "../../redux/auth/service";
import SignIn from "../../components/ui/Auth/Login";

/**
 * Creating styled component using section.
 * Used as a parent container in view. 
 * @ProjectsSection
 *
 */

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

/**
 * Creating styled component using div.
 * Used to contain ProjectsHeader and ProjectGridContainer. 
 * @ProjectsContainer
 *
 */

export const ProjectsContainer = (styled as any).div`
	  display: flex;
	  flex: 1;
	  flex-direction: column;
	  margin: 0 auto;
	  max-width: 1200px;
	  padding: 0 20px;
`;

/**
 * Creating styled component using section inheriting {ProjectsContainer}. 
 * Used when user is newly onboard and has no existing projects.
 * @ProjectsContainer
 * @WelcomeContainer
 */
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

/**
 * Creating styled component using div. 
 * Used to show the projects page header content.
 * @ProjectsHeader
 *
 */
export const ProjectsHeader = (styled as any).div`
	  margin-bottom: 36px;
	  display: flex;
	  justify-content: space-between;
	  align-items: center;
`;

/**
 *Defining contextMenuId for rendering menus.
 *@contextMenuId
 * 
 */
const contextMenuId = "project-menu";

/** 
 *Declairing Props component.
 * @api is of type {Api} EventEmitter.
 * @history is of type object.
 * @router is of type Router
 */
type Props = {
	  api: Api;
	  history: object;
	  router: Router;
	  authState?: any;
	  doLoginAuto?: any;
	  logoutUser?: typeof logoutUser;
};
/**
 *Creating type ProjectsPageState. 
 */
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

/**
 * function to get authState.
 * @mapStateToProps
 */

const mapStateToProps = (state: any): any => {
  return {
    authState: selectAuthState(state),
  };
};

/**
 *function to bind auto login and user.
 *@mapDispatchToProps
 *
 */

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  doLoginAuto: bindActionCreators(doLoginAuto, dispatch),
  logoutUser: bindActionCreators(logoutUser, dispatch),
});

/**
 *Component to render the existing projects in grids with a grid to add new project. 
 *@ProjectsPage
 */
const ProjectsPage = (props: Props) => {
	
 // creating types using props.
  const {
    api,
    history,
    router,
    authState,
    doLoginAuto,
    logoutUser
  } = props;

  const [projects, setProjects] = useState([]); // constant projects intialized with an empty array.  
  const [loading, setLoading] = useState(false);// constant loading intialized with false. 
  const isAuthenticated = api.isAuthenticated();// intialized with value returning from api.isAuthenticated()  
  const [error, setError] = useState(null);// constant error intialized with null. 
  const authUser = authState.get('authUser');// authUser intialized by getting property from authState object.
  const user = authState.get('user');// user intialized by getting value from authState object.

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

/**
 *function to delete project
 */
  const onDeleteProject = async (project) => {
    try {
	
	  // calling api to delete project on the basis of project_id.
      await api.deleteProject(project.project_id);

	  // setting projects after removing deleted project.
      setProjects(projects.filter(
          (p) => p.project_id !== project.project_id
      ));
    } catch (error) {
      console.log('Delete project error');
    }
  };

/**
 *function to adding a route to the router object.
 */
  const routeTo = (route: string) => () => {
    router.push(route);
  };

/**
 *function to render the ContextMenu component with MenuItem component delete. 
 */
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

/**
 *Calling a functional component connectMenu for creating ProjectContextMenu.
 *
 */
  const ProjectContextMenu = connectMenu(contextMenuId)(renderContextMenu);

 // Declairing an array 
  const topTemplates = [];

 // Adding first four templates of tamplates array to topTemplate array.
  for (let i = 0; i < templates.length && i < 4; i++) {
    topTemplates.push(templates[i]);
  }
 
 //function to logout user.
  const handleLogout = () => logoutUser();

  /**
   * Rendering view for projects page, if user is not login yet then showing login view.  
   * if user is loged in and has no existing projects then we showing welcome view, providing link for the tutorials.
   * if user has existing projects then we show the existing projects in grids and a grid to add new project.
   *
   */
  return (
      <>
      { !isAuthenticated || !authUser ?   
        <ProjectsSection>
          <ProjectsContainer>
            <ProjectsHeader>
                <h1>Please Login</h1>
              </ProjectsHeader>
            <ProjectGridContainer>
              <ProjectGridContent>  
                <SignIn />
              </ProjectGridContent>  
            </ProjectGridContainer>
          </ProjectsContainer>
        </ProjectsSection>
        :
        <ProjectGridHeader>
          <ProjectGridHeaderRow />
          <ProjectGridHeaderRow>
            <MediumButton onClick={handleLogout}>Logout</MediumButton>
          </ProjectGridHeaderRow>
        </ProjectGridHeader>        
      }
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
