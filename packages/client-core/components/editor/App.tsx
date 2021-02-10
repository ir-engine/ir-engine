/* eslint-disable react/no-unused-state */
import dynamic from "next/dynamic";
import { Component } from "react";
import Api from "./Api";
const EditorContainer = dynamic(() =>
  import(/* webpackChunkName: "project-page", webpackPrefetch: true */ "./EditorContainer")
);
type AppProps = {
  api: Api;
};
type AppState = {
  isAuthenticated: any;
};
export default class App extends Component<AppProps, AppState> {
  constructor(props) {
    super(props);
    this.state = {
      isAuthenticated: props.api.isAuthenticated()
    };
  }
  componentDidMount(): void {
    this.props.api.addListener(
      "authentication-changed",
      this.onAuthenticationChanged
    );
  }
  componentWillUnmount(): void {
    this.props.api.removeListener(
      "authentication-changed",
      this.onAuthenticationChanged
    );
  }
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
