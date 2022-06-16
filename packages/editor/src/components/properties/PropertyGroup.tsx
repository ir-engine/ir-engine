import React, { Fragment } from 'react'
import styled from 'styled-components'

// styled component used as root element for property group
const StyledPropertyGroup = (styled as any).div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 100%;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
`

// PropertyGroupHeader used to provide styles for property group header
const PropertyGroupHeader = (styled as any).div`
  display: flex;
  flex-direction: row;
  align-items: left;
  font-weight: bold;
  color: var(--textColor);
  padding: 0 8px 8px;
  :last-child {
    margin-left: auto;
  }
`

// PropertyGroupDescription used to show the property group description
const PropertyGroupDescription = (styled as any).div`
  color: var(--textColor);
  white-space: pre-wrap;
  padding: 0 8px 8px;
`

// component to contain content of property group
const PropertyGroupContent = (styled as any).div`
  display: flex;
  flex-direction: column;
`

interface Props {
  name?: string
  description?: string
  children?: React.ReactNode
}

// function to create property group view
const PropertyGroup = ({ name, description, children, ...rest }: Props) => {
  return (
    <StyledPropertyGroup {...rest}>
      <PropertyGroupHeader>{name}</PropertyGroupHeader>
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
