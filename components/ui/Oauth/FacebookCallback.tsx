import { useRouter, NextRouter } from 'next/router'
import React, { Component } from 'react'
import { loginUserByJwt, refreshConnections } from '../../../redux/auth/service'
import { Container } from '@material-ui/core'
import { selectAuthState } from '../../../redux/auth/selector'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'

type Props = {
  auth: any
  router: NextRouter
  loginUserByJwt: typeof loginUserByJwt,
  refreshConnections: typeof refreshConnections
}

const mapStateToProps = (state: any) => {
  return {
    auth: selectAuthState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loginUserByJwt: bindActionCreators(loginUserByJwt, dispatch),
  refreshConnections: bindActionCreators(refreshConnections, dispatch)
})

class FacebookCallback extends Component<Props> {
  state = {
    error: '',
    token: ''
  }

  componentDidMount() {
    const router = this.props.router
    const error = router.query.errror as string
    const token = router.query.token as string
    const type = router.query.type as string

    if (error) {
      // Nothing to do.
    } else {
      if (type === 'connection') {
        const user = this.props.auth.get('user')
        this.props.refreshConnections(user.id)
      } else {
        this.props.loginUserByJwt(token, '/', '/')
      }
    }

    this.setState({
      error,
      token
    })
  }

  render() {
    const { error } = this.state

    if (error && error !== '') {
      return (
        <Container>
          Facebook authenticatin failed.
          <br />
          {error}
        </Container>
      )
    } else {
      return <Container>Authenticating...</Container>
    }
  }
}

const FacebookCallbackWraper = (props: any) => {
  const router = useRouter()
  return <FacebookCallback {...props} router={router} />
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FacebookCallbackWraper)
