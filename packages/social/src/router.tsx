import React from 'react'
import { Route, Switch } from 'react-router-dom'

class RouterComp extends React.Component<{}, { hasError: boolean }> {
  static getDerivedStateFromError() {
    return { hasError: true }
  }

  constructor(props) {
    super(props)

    this.state = { hasError: false }
  }

  componentDidCatch() {
    setTimeout(() => {
      this.setState({ hasError: false })
    }, 2000)
  }

  render() {
    if (this.state.hasError) return <div>Working...</div>

    return (
      <Switch>
        <Route path="/" component={React.lazy(() => import('./pages/index'))} exact />
        <Route path="/login" component={React.lazy(() => import('./pages/login'))} />

        {/* Debug Routes */}
        <Route path="/webxr" component={React.lazy(() => import('./pages/webxr'))} />

        {/* Admin Routes */}
        <Route path="/admin/armedia" component={React.lazy(() => import('./pages/admin/armedia'))} />
        <Route path="/admin/thefeeds" component={React.lazy(() => import('./pages/admin/thefeeds'))} />
        <Route path="/admin/feeds" component={React.lazy(() => import('./pages/admin/feeds'))} />
        <Route path="/admin/users" component={React.lazy(() => import('./pages/admin/users'))} />
        <Route path="/admin" component={React.lazy(() => import('./pages/admin/index'))} />

        {/* Editor Routes */}
        <Route
          path="/editor/:projectId"
          component={React.lazy(() => import('@xrengine/editor/src/pages/projects/[projectId]'))}
        />
        <Route path="/editor" component={React.lazy(() => import('@xrengine/editor/src/pages/projects'))} />
        {/* <Route path="/editor/create" component={React.lazy(() => import('@xrengine/editor/src/pages/create'))} /> */}
        {/* <Redirect path="/editor" to="/editor" /> */}

        {/* <Route path="/editor/create" component={React.lazy(() => import('./pages/admin/editor'))} /> */}

        {/* Auth Routes */}
        <Route path="/auth/oauth/facebook" component={React.lazy(() => import('./pages/auth/oauth/facebook'))} />
        <Route path="/auth/oauth/github" component={React.lazy(() => import('./pages/auth/oauth/github'))} />
        <Route path="/auth/oauth/google" component={React.lazy(() => import('./pages/auth/oauth/google'))} />
        <Route path="/auth/oauth/linkedin" component={React.lazy(() => import('./pages/auth/oauth/linkedin'))} />
        <Route path="/auth/confirm" component={React.lazy(() => import('./pages/auth/confirm'))} />
        <Route path="/auth/forgotpassword" component={React.lazy(() => import('./pages/auth/forgotpassword'))} />
        <Route path="/auth/magiclink" component={React.lazy(() => import('./pages/auth/magiclink'))} />

        {/* Registration Routes */}
        <Route path="/registration" component={React.lazy(() => import('./pages/Registration'))} />

        {/* Post Routes */}
        <Route path="/post/:pid" component={React.lazy(() => import('./pages/post/[pid]'))} />

        <Route path="/activity" component={React.lazy(() => import('./pages/activity'))} />
        <Route path="/creator" component={React.lazy(() => import('./pages/creator'))} />
        <Route path="/creatorEdit" component={React.lazy(() => import('./pages/creatorEdit'))} />
        <Route path="/explore" component={React.lazy(() => import('./pages/creatorEdit'))} />
        <Route path="/feed" component={React.lazy(() => import('./pages/feed'))} />
        <Route path="/login" component={React.lazy(() => import('./pages/login'))} />
        <Route path="/messages" component={React.lazy(() => import('./pages/messages'))} />
        <Route path="/newfeed" component={React.lazy(() => import('./pages/newfeed'))} />
        <Route path="/notifications" component={React.lazy(() => import('./pages/notifications'))} />
        <Route path="/onboarding" component={React.lazy(() => import('./pages/onboarding'))} />
        <Route path="/videorecord" component={React.lazy(() => import('./pages/videorecord'))} />
        <Route path="/privacypolicy" component={React.lazy(() => import('./pages/privacypolicy'))} />

        {/* Terms and Policy */}
        <Route path="/terms" component={React.lazy(() => import('./pages/TermsAndPolicy/terms'))} />
        <Route path="/policy" component={React.lazy(() => import('./pages/TermsAndPolicy/policy'))} />

        <Route path="/:pid" component={React.lazy(() => import('./pages/[pid]'))} />

        <Route path="*" component={React.lazy(() => import('./pages/404'))} />
      </Switch>
    )
  }
}

export default RouterComp
