import Link from 'next/link'
import React from 'react'

const NavBar: React.FunctionComponent = () => (
  <div>
    <Link href="/">
      <a>Home</a>
    </Link>{' '}
        |{' '}
    <Link href="/login">
      <a>Login</a>
    </Link>{' '}
        |{' '}
    <Link href="/users">
      <a>Users List</a>
    </Link>{' '}
        | <a href="/api/users">Users API</a>
  </div>
)

export default NavBar