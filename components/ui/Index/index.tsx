// import NavItem from '../NavItem'
import React, { Component } from 'react'

import './style.scss'
import { connect } from 'react-redux'
// TODO: Generate nav items from a config file




class Index extends Component {
    render() {
        return (
            <div className="container">
                <div className="box"
                     onClick={() => window.location.href = '/videos'}>
                    360 Video Gallery
                </div>
                <div className="box"
                     onClick={() => window.location.href = '/space'}>
                    XR Space
                </div>
            </div>
        )
    }
}

export default connect(
)(Index);
