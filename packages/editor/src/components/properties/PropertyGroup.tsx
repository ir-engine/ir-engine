import React, { Fragment } from 'react'
import styled from 'styled-components'

// styled component used as root element for property group
const StyledPropertyGroup = (styled as any).div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 100%;
  padding: 12px 0;
  border-bottom: 1px solid ${(props) => props.theme.border};
`

// PropertyGroupHeader used to provide styles for property group header
const PropertyGroupHeader = (styled as any).div`
  display: flex;
  flex-direction: row;
  align-items: left;
  font-weight: bold;
  color: ${(props) => props.theme.text2};
  padding: 0 8px 8px;
  :last-child {
    margin-left: auto;
  }
`

// PropertyGroupDescription used to show the property group description
const PropertyGroupDescription = (styled as any).div`
  background-color: ${(props) => props.theme.panel};
  color: ${(props) => props.theme.text2};
  white-space: pre-wrap;
  padding: 0 8px 8px;
`

// component to contain content of property group
const PropertyGroupContent = (styled as any).div`
  display: flex;
  flex-direction: column;
`

// function to create property group view
function PropertyGroup(props) {
  const { name, description, children, ...rest } = props

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
