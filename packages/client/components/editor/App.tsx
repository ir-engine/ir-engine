/* eslint-disable react/no-unused-state */
import React, { Component } from "react";
// import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import configs from "./configs";
import GlobalStyle from "./GlobalStyle";
import Loading from "./Loading";
import Error from "./Error";
// import { ApiContextProvider } from "./contexts/ApiContext";
import dynamic from "next/dynamic";
// import RedirectRoute from "./router/RedirectRoute";
import ProjectsPage from "./projects/ProjectsPage";
import CreateProjectPage from "./projects/CreateProjectPage";
import { ThemeProvider } from "styled-components";
import { Column } from "./layout/Flex";
import theme from "./theme";
import Api from "./Api";
const EditorContainer = dynamic(() =>
  import(/* webpackChunkName: "project-page", webpackPrefetch: true */ "./EditorContainer")
);

/**
 * [AppProps used to provide access to Api component using propery api]
 * @type {Object}
 */
type AppProps = {
  api: Api;
};

/**
 * [AppState used to check if user is authenticated or not.]
 * @type {Object}
 */
type AppState = {
  isAuthenticated: any;
};

/**
 * [App component root component of application]
 * @type {Component class}
 */
export default class App extends Component<AppProps, AppState> {

 //setting the state of component.
 //called when object of class created created.
  constructor(props) {
    super(props);
    this.state = {
      isAuthenticated: props.api.isAuthenticated()
    };
  }

  // called when component get mounted
  // adding listener
  componentDidMount(): void {
    this.props.api.addListener(
      "authentication-changed",
      this.onAuthenticationChanged
    );
  }

  //called when component get unmounted
  //removing listener
  componentWillUnmount(): void {
    this.props.api.removeListener(
      "authentication-changed",
      this.onAuthenticationChanged
    );
  }

  //setting state when listener get exicuted.
  onAuthenticationChanged = (isAuthenticated): void => {
    this.setState({ isAuthenticated });
  };
  
  render(): any {
    const api = this.props.api;
    return (
      // <ApiContextProvider value={api}>
        // <ThemeProvider theme={theme}>
          {/* <Router basename={"/editor"}>
            <GlobalStyle />
            <Column
            >
              <Switch>
                  <RedirectRoute path="/" exact to="/projects" />
                <RedirectRoute path="/new" exact to="/projects" />
                <Route
                  path="/projects/create"
                  exact
                  component={CreateProjectPage}
                />
                <RedirectRoute
                  path="/projects/templates"
                  exact
                  to="/projects/create"
                />
                <Route path="/projects" exact component={ProjectsPage} />
                <Route
                  path="/projects/:projectId"
                  component={EditorContainer}
                />
                <Route render={() => <Error message="Page not found." />} />
              </Switch>
            </Column>
          </Router> */}
        // </ThemeProvider>
      // </ApiContextProvider>
    );
  }
}
