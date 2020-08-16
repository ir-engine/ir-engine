import React, { Component, Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import PropTypes from "prop-types";
import configs from "../configs";

import GlobalStyle from "./GlobalStyle";

import Loading from "./Loading";
import Error from "./Error";

import { ApiContextProvider } from "./contexts/ApiContext";

import RedirectRoute from "./router/RedirectRoute";

import ProjectsPage from "./projects/ProjectsPage";
import CreateProjectPage from "./projects/CreateProjectPage";

import { ThemeProvider } from "styled-components";

import { Column } from "./layout/Flex";

import theme from "./theme";

const EditorContainer = lazy(() =>
  import(/* webpackChunkName: "project-page", webpackPrefetch: true */ "./EditorContainer")
);

const PackageKitPage = lazy(() =>
  import(/* webpackChunkName: "package-kit-page", webpackPrefetch: true */ "./assets/PackageKitPage")
);

export default class App extends Component {
  static propTypes = {
    api: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      isAuthenticated: props.api.isAuthenticated()
    };
  }

  componentDidMount() {
    this.props.api.addListener("authentication-changed", this.onAuthenticationChanged);
  }

  onAuthenticationChanged = isAuthenticated => {
    this.setState({ isAuthenticated });
  };

  componentWillUnmount() {
    this.props.api.removeListener("authentication-changed", this.onAuthenticationChanged);
  }

  render() {
    const api = this.props.api;

    return (
      <ApiContextProvider value={api}>
          <ThemeProvider theme={theme}>
            <Router basename={process.env.ROUTER_BASE_PATH}>
              <GlobalStyle />
              <Column as={Suspense} fallback={<Loading message="Loading..." fullScreen />}>
                <Switch>
                  {!configs.isXR3() && <RedirectRoute path="/" exact to="/projects" />}
                  <RedirectRoute path="/new" exact to="/projects" />
                  <Route path="/projects/create" exact component={CreateProjectPage} />
                  <RedirectRoute path="/projects/templates" exact to="/projects/create" />
                  <Route path="/projects" exact component={ProjectsPage} />
                  <Route path="/projects/:projectId" component={EditorContainer} />
                  <Route path="/kits/package" component={PackageKitPage} />
                  <Route render={() => <Error message="Page not found." />} />
                </Switch>
              </Column>
            </Router>
          </ThemeProvider>
      </ApiContextProvider>
    );
  }
}
