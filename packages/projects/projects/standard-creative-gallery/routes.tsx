import React from 'react'
import { Route, Redirect } from 'react-router-dom'

export default function (route: string) {
  switch (route) {
    case '/':
      return [
        <Route key="/" path="/" component={React.lazy(() => import('@xrengine/gallery/src/pages/index'))} exact />
      ]
    case '/login':
      return [
        <Route key="/login" path="/login" component={React.lazy(() => import('@xrengine/gallery/src/pages/login'))} />
      ]
    case '/admin':
      return [
        <>
          <Route
            key="/admin/thefeeds"
            path="/admin/thefeeds"
            component={React.lazy(() => import('@xrengine/gallery/src/pages/admin/thefeeds'))}
          />
          <Route
            key="/admin/feeds"
            path="/admin/feeds"
            component={React.lazy(() => import('@xrengine/gallery/src/pages/admin/feeds'))}
          />
          <Route
            key="/admin/users"
            path="/admin/users"
            component={React.lazy(() => import('@xrengine/gallery/src/pages/admin/users'))}
          />
          <Route
            key="/admin"
            path="/admin"
            component={React.lazy(() => import('@xrengine/gallery/src/pages/admin/index'))}
          />
        </>
      ]
    case '/auth':
      return [
        <>
          <Route
            key="/auth/oauth/facebook"
            path="/auth/oauth/facebook"
            component={React.lazy(() => import('@xrengine/gallery/src/pages/auth/oauth/facebook'))}
          />
          <Route
            key="/auth/oauth/github"
            path="/auth/oauth/github"
            component={React.lazy(() => import('@xrengine/gallery/src/pages/auth/oauth/github'))}
          />
          <Route
            key="/auth/oauth/google"
            path="/auth/oauth/google"
            component={React.lazy(() => import('@xrengine/gallery/src/pages/auth/oauth/google'))}
          />
          <Route
            key="/auth/oauth/linkedin"
            path="/auth/oauth/linkedin"
            component={React.lazy(() => import('@xrengine/gallery/src/pages/auth/oauth/linkedin'))}
          />
          <Route
            key="/auth/confirm"
            path="/auth/confirm"
            component={React.lazy(() => import('@xrengine/gallery/src/pages/auth/confirm'))}
          />
          <Route
            key="/auth/forgotpassword"
            path="/auth/forgotpassword"
            component={React.lazy(() => import('@xrengine/gallery/src/pages/auth/forgotpassword'))}
          />
          <Route
            key="/auth/magiclink"
            path="/auth/magiclink"
            component={React.lazy(() => import('@xrengine/gallery/src/pages/auth/magiclink'))}
          />
        </>
      ]
    case '/:id':
      return [<Route key="/:id" path="/:id" component={React.lazy(() => import('@xrengine/gallery/src/pages/feed'))} />]
    case '/post':
      return [
        <Route
          key="/post/:pid"
          path="/post/:pid"
          component={React.lazy(() => import('@xrengine/gallery/src/pages/post/[pid]'))}
        />
      ]
    case '/activity':
      return [
        <Route
          key="/activity"
          path="/activity"
          component={React.lazy(() => import('@xrengine/gallery/src/pages/activity'))}
        />
      ]
    case '/creator':
      return [
        <Route
          key="/creator"
          path="/creator"
          component={React.lazy(() => import('@xrengine/gallery/src/pages/creator'))}
        />
      ]
    case '/creatorEdit':
      return [
        <Route
          key="/creatorEdit"
          path="/creatorEdit"
          component={React.lazy(() => import('@xrengine/gallery/src/pages/creatorEdit'))}
        />
      ]
    case '/explore':
      return [
        <Route
          key="/explore"
          path="/explore"
          component={React.lazy(() => import('@xrengine/gallery/src/pages/creatorEdit'))}
        />
      ]
    case '/feed':
      return [
        <Route key="/feed" path="/feed" component={React.lazy(() => import('@xrengine/gallery/src/pages/feed'))} />
      ]
    case '/messages':
      return [
        <Route
          key="/messages"
          path="/messages"
          component={React.lazy(() => import('@xrengine/gallery/src/pages/messages'))}
        />
      ]
    case '/newfeed':
      return [
        <Route
          key="/newfeed"
          path="/newfeed"
          component={React.lazy(() => import('@xrengine/gallery/src/pages/newfeed'))}
        />
      ]
    case '/notifications':
      return [
        <Route
          key="/notifications"
          path="/notifications"
          component={React.lazy(() => import('@xrengine/gallery/src/pages/notifications'))}
        />
      ]
    case '/:pid':
      return [
        <Route key="/:pid" path="/:pid" component={React.lazy(() => import('@xrengine/gallery/src/pages/[pid]'))} />
      ]
  }
  return []
}
