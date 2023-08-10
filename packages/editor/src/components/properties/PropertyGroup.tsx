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

import React, { Fragment } from 'react'

import CloseIcon from '@mui/icons-material/Close'

import './PropertyGroup.css'

// Import the external CSS file
interface Props {
  name?: string
  description?: string
  onClose?: () => void
  children?: React.ReactNode
  rest?: Record<string, unknown>
}

const PropertyGroup = ({ name, description, children, onClose, ...rest }: Props) => {
  return (
    <div className="property-group" {...rest}>
      <div className="property-group-header">
        {name}
        {onClose && (
          <button className="property-close-button" onPointerUp={onClose}>
            <CloseIcon fontSize="inherit" />
          </button>
        )}
      </div>
      {description && (
        <div className="property-group-description">
          {description.split('\\n').map((line, i) => (
            <Fragment key={i}>
              {line}
              <br />
            </Fragment>
          ))}
        </div>
      )}
      <div className="property-group-content">{children}</div>
    </div>
  )
}

export default PropertyGroup
