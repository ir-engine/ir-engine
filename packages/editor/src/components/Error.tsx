import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { ThemeContext } from './theme'
import { withTranslation } from 'react-i18next'

/**
 * StyledError styled component used to provide styles for error container.
 *
 * @type {styled component}
 */
const StyledError = (styled as any).div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  color: ${(props) => props.theme.red};

  svg {
    margin-bottom: 20px;
  }
`
/**
 * Error component used to error message.
 *
 * @author Robert Long
 * @type {component class}
 */
export class Error extends Component<{ t: Function }> {
  static propTypes = {
    message: PropTypes.node,
    t: PropTypes.func
  }

  static contextType = ThemeContext

  // rendering error message
  render() {
    const theme = this.context
    return (
      <StyledError theme={theme}>
        <a href="/">{this.props.t('editor:lbl-return')}</a>
        {(this.props as any).message}
      </StyledError>
    )
  }
}

export default withTranslation()(Error)
