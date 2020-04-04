import Link from '@material-ui/core/Typography'
import NextLink from 'next/link'
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
        <NextLink href={this.props.href} >
          <Link title={this.props.title}>{this.props.text}</Link>
        </NextLink>
      </Button>
    )
  }
}
export default NavItem
