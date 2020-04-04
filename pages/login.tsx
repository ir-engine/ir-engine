import React from 'react'
import Link from 'next/link'
import Layout from '../components/ui/Layout'

type State = {
  email?: '',
  password?: ''
}

export default class LoginPage extends React.Component {
  state : State = {
    email: '',
    password: ''
  }

  handleInput = (e: any) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  handleEmailLogin = (e: any) => {
    e.preventDefault()
  }

  handleEmailSignup = (e: any) => {
    e.preventDefault()
  }

  render() {
    return (
      <Layout pageTitle="Login">
        <h1>Login</h1>

        <Link href="/oauth/github">
          <a>Log In With Github</a>
        </Link>

        <form>
          <input
            type="email"
            name="email"
            placeholder="email"
            value={this.state.email}
            onChange={(e) => this.handleInput(e)}
          />
          <br />
          <input
            type="password"
            name="password"
            placeholder="password"
            value={this.state.password}
            onChange={(e) => this.handleInput(e)}
          />
          <button
            type="button"
            id="signup"
            onClick={(e) => this.handleEmailSignup(e)}
          >
            Sign Up
          </button>
          <button id="login" onClick={(e) => this.handleEmailLogin(e)}>
            {' '}
            Login{' '}
          </button>
        </form>
      </Layout>
    )
  }
}
