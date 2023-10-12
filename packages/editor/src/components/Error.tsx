/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React from 'react'
import { useTranslation } from 'react-i18next'

const styledErrorStyles: React.CSSProperties = {
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  width: '100vw',
  color: 'var(--red)'
}

const StyledError = ({ children }) => {
  return <div style={styledErrorStyles}>{children}</div>
}

export const Error = (props) => {
  const { t } = useTranslation()

  // Rendering error message
  // Assuming the context variable 'theme' is available somewhere in your application.
  const theme = context // TODO: Replace 'context' with the actual theme context variable.

  // we were using the theme like this <StyledError theme={theme} > but moving to plain css from styled components will invalidate that
  return (
    <StyledError>
      <a href="/">{t('editor:lbl-return')}</a>
      {props.message}
    </StyledError>
  )
}

export default Error
