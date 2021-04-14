import React from 'react';
import { Route, Switch } from 'react-router-dom';

import HomePage from './pages/index';
import LocationPage from './pages/location/[locationName]';


export const RouterComp = () => {
    return (
        <Switch>
            <Route path="/" component={HomePage} exact />
            <Route path="/location/:locationName" component={LocationPage} />
        </Switch>
    );
}

export default RouterComp;