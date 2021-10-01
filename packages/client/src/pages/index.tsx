import { ExternalProvider, Web3Provider } from "@ethersproject/providers";
import { Web3ReactProvider } from "@web3-react/core";
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { RecoilRoot } from "recoil";
import Header from "../components/Header";
import { ICContext, useICContextValues } from "../ic/context";
import "../styles/globals.css";
import UserWall from "./UserWall";
import Wall from "./Wall";

function getLibrary(provider: ExternalProvider) {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

const HomePage = (props: any) => {
  const icContextValues = useICContextValues();
  return (
    <RecoilRoot>
      <Web3ReactProvider getLibrary={getLibrary}>
        <ICContext.Provider value={icContextValues}>
          <Router>
            <div className="bg-green-900">
              <Header />
              <main>
                <Switch>
                  <Route exact path="/">
                    <React.Suspense fallback={null}>
                      <Wall />
                    </React.Suspense>
                  </Route>
                  <Route path="/:urlEthAccount">
                    <React.Suspense fallback={null}>
                      <UserWall />
                    </React.Suspense>
                  </Route>
                </Switch>
              </main>
            </div>
          </Router>

        </ICContext.Provider>
      </Web3ReactProvider>
    </RecoilRoot>
  );
};

export default HomePage;