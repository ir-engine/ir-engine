import React, { ComponentType } from 'react'
import { connect } from 'react-redux'
import { setViewportSize } from '../../../redux/app/actions'
// requires aframe only once and renders the page, passing 'aframeReady' boolean
interface Props {
  Component: ComponentType
  pageProps: any,
  setViewportSize: (width: number, height: number) => void
}

let lastResize = 0

type State = {
  aframeReady: boolean
}

class PageLoader extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      aframeReady: false
    }
  }

  componentDidMount() {
    this.onResize = this.onResize.bind(this)
    // load aframe only once
    // each page will no longer need to require aframe
    if (typeof window !== 'undefined') {
      require('aframe')
      this.setState({ aframeReady: true })
      window.addEventListener('resize', this.onResize)
      // The below line breaks login for some reason.
      // Unsure if it's necessary, leaving it in but commented out for now.
      // this.onResize()
      return () => {
        window.removeEventListener('resize', this.onResize)
      }
    }
  }

  onResize() {
    if (this.props.setViewportSize) {
      // if last resize was more than 33ms ago, resize (don't resize excessively per 1/3 second)
      const dateNow = Date.now()
      if (lastResize < dateNow - 33) {
        this.props.setViewportSize(window.innerWidth, window.innerHeight)
        lastResize = dateNow
      }
    }
  }

  render() {
    const { Component, pageProps } = this.props
    return <Component {...pageProps} aframeReady={this.state.aframeReady} />
  }
}

const mapStateToProps = null
const mapDispatchToProps = {
  setViewportSize
}

export default connect(mapStateToProps, mapDispatchToProps)(PageLoader)
