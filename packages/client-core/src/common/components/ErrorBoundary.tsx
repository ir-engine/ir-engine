import React from 'react'

import Catch from './functionalErrorBoundary'

type Props = {
  children: React.ReactNode
}

const ErrorBoundary = Catch(function error(props: Props, error?: Error) {
  if (error) {
    return (
      <div className="error-screen">
        <h2>An error has occured</h2>
        <h4>{error.message}</h4>
      </div>
    )
  } else {
    return <React.Fragment>{props.children}</React.Fragment>
  }
})

export default ErrorBoundary
