import React from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { ThemeContext } from '@xrengine/client-core/src/util/theme'

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
export const Error = (props: any) => {
  const { t } = useTranslation()

  // rendering error message
  const theme = context

  return (
    <StyledError theme={theme}>
      <a href="/">{t('editor:lbl-return')}</a>
      {props.message}
    </StyledError>
  )
}

Error.contextType = ThemeContext

export default Error
