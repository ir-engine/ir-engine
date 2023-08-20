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

import React, { ReactNode } from 'react'

/**
 * BlockFormField used to provide styles for block FormField div.
 */
const blockFormFieldStyle = {
  marginBottom: '16px'
}

/**
 * InlineFormField used to provide styles for inline FormField div.
 */
const inlineFormFieldStyle = {
  display: 'flex',
  justifyContent: 'space-between'
}

const inlineFormFieldChildStyle = {
  marginLeft: '30px',
  alignSelf: 'center'
}

const firstChildStyle = {
  marginLeft: '0'
}

interface FormFieldProp {
  inline?: any
  children?: ReactNode
}

/**
 * FormField function component used to render form fields.
 *
 * @param       {boolean} inline
 * @param       {string} children
 * @param       {any} rest
 * @constructor
 */
export function FormField({ inline, children, ...rest }: FormFieldProp) {
  if (inline) {
    return (
      <div style={{ ...inlineFormFieldStyle, ...rest }}>
        {React.Children.map(children, (child, index) => {
          return (
            <div style={index === 0 ? { ...inlineFormFieldChildStyle, ...firstChildStyle } : inlineFormFieldChildStyle}>
              {child}
            </div>
          )
        })}
      </div>
    )
  }

  return <div style={{ ...blockFormFieldStyle, ...rest }}>{children}</div>
}

export default FormField
