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
import styled from 'styled-components'

import CloseIcon from '@mui/icons-material/Close'

// styled component used as root element for property group
const StyledPropertyGroup = (styled as any).div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 100%;
  padding-top: 4px;
  padding-bottom: 4px;
  border-top: 1px solid var(--border);
`

// PropertyGroupHeader used to provide styles for property group header
const PropertyGroupHeader = (styled as any).div`
  display: flex;
  flex-direction: row;
  align-items: left;
  font-weight: bold;
  color: var(--textColor);
  padding: 0 8px;
  height: 16px;
  :last-child {
    margin-left: auto;
  }
`

// PropertyGroupDescription used to show the property group description
const PropertyGroupDescription = (styled as any).div`
  color: var(--textColor);
  white-space: pre-wrap;
  padding: 0 8px;
`

// component to contain content of property group
const PropertyGroupContent = (styled as any).div`
  display: flex;
  flex-direction: column;
`

// component to contain content of property group
const PropertyCloseButton = styled.button`
  display: flex;
  flex-direction: row;
  margin: auto;
  margin-right: 0px;
  font-size: 16px;
  height: 16px;
  background: none;
  border: none;
  color: var(--iconButtonColor);

  &:hover {
    font-size: 14px;
    color: var(--iconButtonHoverColor);
  }

  &:active {
    color: var(--iconButtonSelectedBackground);
  }
`

interface Props {
  name?: string
  description?: string
  onClose?: () => void
  children?: React.ReactNode
  rest?: Record<string, unknown>
}

// function to create property group view
const PropertyGroup = ({ name, description, children, onClose, rest }: Props) => {
  return (
    <StyledPropertyGroup {...rest}>
      <PropertyGroupHeader>
        {name}
        {onClose && (
          <PropertyCloseButton onPointerUp={onClose}>
            <CloseIcon fontSize="inherit" />
          </PropertyCloseButton>
        )}
      </PropertyGroupHeader>
      {description && (
        <PropertyGroupDescription>
          {description.split('\\n').map((line, i) => (
            <Fragment key={i}>
              {line}
              <br />
            </Fragment>
          ))}
        </PropertyGroupDescription>
      )}
      <PropertyGroupContent>{children}</PropertyGroupContent>
    </StyledPropertyGroup>
  )
}

export default PropertyGroup
