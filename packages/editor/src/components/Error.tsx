import React, { Component } from 'react'
import styled from 'styled-components'
import { ThemeContext } from '@xrengine/client-core/src/util/theme'
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
