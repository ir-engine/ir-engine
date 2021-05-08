import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { Config } from '@xrengine/client-core/src/helper';

/**
 * @NB we are not using this routes at the moment Please refer to route/ folder 
 * @returns 
 */
export const RouterComp = () => {
    return (
        <Switch>
            <Route path="/" component={React.lazy(() => import('./pages/index'))} exact />
            <Route path="/login" component={React.lazy(() => import('./pages/login'))} />

            {/* Example Routes */}
            <Route path="/examples/helloworld" component={React.lazy(() => import('./pages/examples/ecs_helloworld'))} />

            {/* Admin Routes */}
            <Route path="/admin/content-packs" component={React.lazy(() => import('./pages/admin/content-packs'))} />
            <Route path="/admin/groups" component={React.lazy(() => import('./pages/admin/groups'))} />
            <Route path="/admin/instance" component={React.lazy(() => import('./pages/admin/instance'))} />
            <Route path="/admin/invites" component={React.lazy(() => import('./pages/admin/invites'))} />
            <Route path="/admin/locations" component={React.lazy(() => import('./pages/admin/locations'))} />
            <Route path="/admin/scenes" component={React.lazy(() => import('./pages/admin/scenes'))} />
            <Route path="/admin/users" component={React.lazy(() => import('./pages/admin/users'))} />
            <Route path="/admin" component={React.lazy(() => import('./pages/admin/index'))} />

            {/* Auth Routes */}
            <Route path="/auth/oauth/facebook" component={React.lazy(() => import('./pages/auth/oauth/facebook'))} />
            <Route path="/auth/oauth/github" component={React.lazy(() => import('./pages/auth/oauth/github'))} />
            <Route path="/auth/oauth/google" component={React.lazy(() => import('./pages/auth/oauth/google'))} />
            <Route path="/auth/oauth/linkedin" component={React.lazy(() => import('./pages/auth/oauth/linkedin'))} />
            <Route path="/auth/oauth/twitter" component={React.lazy(() => import('./pages/auth/oauth/twitter'))} />
            <Route path="/auth/confirm" component={React.lazy(() => import('./pages/auth/confirm'))} />
            <Route path="/auth/forgotpassword" component={React.lazy(() => import('./pages/auth/forgotpassword'))} />
            <Route path="/auth/magiclink" component={React.lazy(() => import('./pages/auth/magiclink'))} />


            {/* Location Routes */}
            <Route path="/location/:locationName" component={React.lazy(() => import('./pages/location/[locationName]'))} />
            <Route path="/video360" component={React.lazy(() => import('./pages/video360'))} />
            <Redirect path="/location" to={"/location/" + Config.publicRuntimeConfig.lobbyLocationName} />

            {/* Harmony Routes */}
            <Route path="/harmony" component={React.lazy(() => import('./pages/harmony/index'))} />

            {/* Editor Routes */}
            <Route path="/editor/projects/:projectId" component={React.lazy(() => import('./pages/editor/projects/[projectId]'))} />
            <Route path="/editor/projects" component={React.lazy(() => import('./pages/editor/projects'))} />
            <Route path="/editor/create" component={React.lazy(() => import('./pages/editor/create'))} />
            <Redirect path="/editor" to="/editor/projects" />

            <Route path="/workerTest" component={React.lazy(() => import('./pages/WorkerTest'))} />
            <Route path="*" component={React.lazy(() => import('./pages/404'))} />
        </Switch>
    );
};

export default RouterComp;