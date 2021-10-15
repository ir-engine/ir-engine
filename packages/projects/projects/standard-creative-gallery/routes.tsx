import React from 'react'
import { Route, Redirect } from 'react-router-dom'

export default function (route: string) {
  switch (route) {
    case '/':
      return <Route path="/" component={React.lazy(() => import('@xrengine/gallery/src/pages//index'))} exact />
    case '/login':
      return <Route path="/login" component={React.lazy(() => import('@xrengine/gallery/src/pages//login'))} />
    case '/admin':
      return (
        <>
          <Route
            path="/admin/thefeeds"
            component={React.lazy(() => import('@xrengine/gallery/src/pages//admin/thefeeds'))}
          />
          <Route path="/admin/feeds" component={React.lazy(() => import('@xrengine/gallery/src/pages//admin/feeds'))} />
          <Route path="/admin/users" component={React.lazy(() => import('@xrengine/gallery/src/pages//admin/users'))} />
          <Route path="/admin" component={React.lazy(() => import('@xrengine/gallery/src/pages//admin/index'))} />
        </>
      )
    case '/auth':
      return (
        <>
          <Route
            path="/auth/oauth/facebook"
            component={React.lazy(() => import('@xrengine/gallery/src/pages//auth/oauth/facebook'))}
          />
          <Route
            path="/auth/oauth/github"
            component={React.lazy(() => import('@xrengine/gallery/src/pages//auth/oauth/github'))}
          />
          <Route
            path="/auth/oauth/google"
            component={React.lazy(() => import('@xrengine/gallery/src/pages//auth/oauth/google'))}
          />
          <Route
            path="/auth/oauth/linkedin"
            component={React.lazy(() => import('@xrengine/gallery/src/pages//auth/oauth/linkedin'))}
          />
          <Route
            path="/auth/confirm"
            component={React.lazy(() => import('@xrengine/gallery/src/pages//auth/confirm'))}
          />
          <Route
            path="/auth/forgotpassword"
            component={React.lazy(() => import('@xrengine/gallery/src/pages//auth/forgotpassword'))}
          />
          <Route
            path="/auth/magiclink"
            component={React.lazy(() => import('@xrengine/gallery/src/pages//auth/magiclink'))}
          />
        </>
      )
    case '/:id':
      return <Route path="/:id" component={React.lazy(() => import('@xrengine/gallery/src/pages//feed'))} />
    case '/post':
      return <Route path="/post/:pid" component={React.lazy(() => import('@xrengine/gallery/src/pages//post/[pid]'))} />
    case '/activity':
      return <Route path="/activity" component={React.lazy(() => import('@xrengine/gallery/src/pages//activity'))} />
    case '/creator':
      return <Route path="/creator" component={React.lazy(() => import('@xrengine/gallery/src/pages//creator'))} />
    case '/creatorEdit':
      return (
        <Route path="/creatorEdit" component={React.lazy(() => import('@xrengine/gallery/src/pages//creatorEdit'))} />
      )
    case '/explore':
      return <Route path="/explore" component={React.lazy(() => import('@xrengine/gallery/src/pages//creatorEdit'))} />
    case '/feed':
      return <Route path="/feed" component={React.lazy(() => import('@xrengine/gallery/src/pages//feed'))} />
    case '/messages':
      return <Route path="/messages" component={React.lazy(() => import('@xrengine/gallery/src/pages//messages'))} />
    case '/newfeed':
      return <Route path="/newfeed" component={React.lazy(() => import('@xrengine/gallery/src/pages//newfeed'))} />
    case '/notifications':
      return (
        <Route
          path="/notifications"
          component={React.lazy(() => import('@xrengine/gallery/src/pages//notifications'))}
        />
      )
    case '/:pid':
      return <Route path="/:pid" component={React.lazy(() => import('@xrengine/gallery/src/pages//[pid]'))} />
  }
}
