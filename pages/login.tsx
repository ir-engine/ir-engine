import React from 'react'
import Link from 'next/link'
import Layout from '../components/Layout'

const LoginPage: React.FunctionComponent = () => (
  <Layout title="LoginPage | Next.js + TypeScript Example">
    <h1>Login</h1>
    <p>This is the login page</p>
    <p>
      <Link href="/">
        <a>Go home</a>
      </Link>
    </p>
  </Layout>
)

export default LoginPage
