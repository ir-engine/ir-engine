import Link from 'next/link'
import React, { Component } from 'react'
import './style.scss'

class NavItem extends Component {
    props: any

    constructor(props: any) {
        super(props)
        this.props = props
    }
    render() {
        return (
            <span>
                <Link href={this.props.href}>
                    <a title={this.props.title}>{this.props.text}</a>
                </Link>
            </span>
        )
    }
}
export default NavItem