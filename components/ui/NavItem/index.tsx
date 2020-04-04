import Link from 'next/link'
import React, { Component } from 'react'
import Button from '@material-ui/core/Button'

import './style.scss'

class NavItem extends Component {
  props: any

  constructor(props: any) {
    super(props)
    this.props = props
  }

  render() {
    return (
      <Button>
        <Link href={this.props.href}>
          <a title={this.props.title}>{this.props.text}</a>
        </Link>
      </Button>
    )
  }
}
export default NavItem
