import React from 'react'

type Props = {
  children: React.ReactNode
}

type ErrorHandler = (error: Error, info: React.ErrorInfo) => void
type ErrorHandlingComponent<Props> = (props: Props, error?: Error) => React.ReactNode

type ErrorState = { error?: Error }

export function createErrorBoundary<P extends Props>(
  component: ErrorHandlingComponent<P>,
  errorHandler?: ErrorHandler
): React.ComponentType<P> {
  return class extends React.Component<P, ErrorState> {
    state: ErrorState = {
      error: undefined
    }

    static getDerivedStateFromError(error: Error) {
      return { error }
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
      if (errorHandler) {
        errorHandler(error, info)
      }
    }

    render() {
      return component(this.props, this.state.error)
    }
  }
}
