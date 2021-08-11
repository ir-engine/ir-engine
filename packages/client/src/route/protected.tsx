import React, { Fragment, Suspense } from 'react'
import { Switch, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import PrivateRoute from './Private'
import CircularProgress from '@material-ui/core/CircularProgress'
import { selectAuthState } from '@xrengine/client-core/src/user/reducers/auth/selector'

const analytic = React.lazy(() => import('../pages/admin/index'))
const avatars = React.lazy(() => import('../pages/admin/avatars'))
const contentPacks = React.lazy(() => import('../pages/admin/content-packs'))
const groups = React.lazy(() => import('../pages/admin/groups'))
const instance = React.lazy(() => import('../pages/admin/instance'))
const invites = React.lazy(() => import('../pages/admin/invites'))
const locations = React.lazy(() => import('../pages/admin/locations'))
const scenes = React.lazy(() => import('../pages/admin/scenes'))
const users = React.lazy(() => import('../pages/admin/users'))
const party = React.lazy(() => import('../pages/admin/party'))
const botSetting = React.lazy(() => import('../pages/admin/bot'))
const arMedia = React.lazy(() => import('../pages/admin/social/armedia'))
const feeds = React.lazy(() => import('../pages/admin/social/feeds'))
const creator = React.lazy(() => import('../pages/admin/social/creator'))
const Scope = React.lazy(() => import('../pages/admin/scope'))

interface Props {
  authState?: any
}

const mapStateToProps = (state: any): any => {
  return {
    authState: selectAuthState(state)
  }
}

const ProtectedRoutes = (props: Props) => {
  const { authState } = props
  const admin = authState.get('user')

  if (admin?.userRole) {
    if (admin?.userRole !== 'admin') {
      return <Redirect to="/login" />
    }
  }

  return (
    <Fragment>
      <Suspense
        fallback={
          <div
            style={{
              height: '100vh',
              width: '100%',
              textAlign: 'center',
              paddingTop: 'calc(50vh - 7px)'
            }}
          >
            <CircularProgress />
          </div>
        }
      >
        <Switch>
          <PrivateRoute exact path="/admin" component={analytic} />
          <PrivateRoute exact path="/admin/avatars" component={avatars} />
          <PrivateRoute exact path="/admin/content-packs" component={contentPacks} />
          <PrivateRoute exact path="/admin/groups" component={groups} />
          <PrivateRoute exact path="/admin/instance" component={instance} />
          <PrivateRoute exact path="/admin/invites" component={invites} />
          <PrivateRoute exact path="/admin/locations" component={locations} />
          <PrivateRoute exact path="/admin/scenes" component={scenes} />
          <PrivateRoute exact path="/admin/parties" component={party} />
          <PrivateRoute exact path="/admin/scope" component={Scope} />
          <PrivateRoute exact path="/admin/bots" component={botSetting} />
          <PrivateRoute exact path="/admin/armedia" component={arMedia} />
          <PrivateRoute exact path="/admin/feeds" component={feeds} />
          <PrivateRoute exact path="/admin/creator" component={creator} />
          <PrivateRoute exact Path="/admin/users" component={users} />

          {/* <Route path="/admin/tips-and-tricks" component={React.lazy(() => import('./pages/admin/tips-and-tricks'))} />
        <Route path="/admin/thefeeds" component={React.lazy(() => import('./pages/admin/thefeeds'))} />
        <Route path="/admin/feeds" component={React.lazy(() => import('./pages/admin/feeds'))} />
        <Route path="/admin/users" component={React.lazy(() => import('./pages/admin/users'))} /> */}
        </Switch>
      </Suspense>
    </Fragment>
  )
}

export default connect(mapStateToProps, null)(ProtectedRoutes)
