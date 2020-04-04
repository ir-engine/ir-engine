import NavItem from './NavItem'
import React, { Component } from 'react'

// TODO: Generate nav items from a config file

type Props = {
}

class Navbar extends Component {
  props: Props

  constructor(props: any) {
    super(props)
    this.props = props
  }
  render() {
    return (
      <nav>
        <NavItem href="/" title="Home" text="Home" />
        <NavItem href="/settings" title="Settings" text="Settings"  />
        <NavItem href="/admin" title="Admin" text="Admin" />
        <NavItem href="/login" title="Login" text="Login" />
      </nav>
    )
  }
}
export default Navbar