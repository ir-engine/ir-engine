import React, { Fragment } from 'react'
import styled from 'styled-components'

import CloseIcon from '@mui/icons-material/Close'

// styled component used as root element for property group
const StyledPropertyGroup = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 100%;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
`

// PropertyGroupHeader used to provide styles for property group header
const PropertyGroupHeader = styled.div`
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
const PropertyGroupDescription = styled.div`
  color: var(--textColor);
  white-space: pre-wrap;
  padding: 0 8px 8px;
`

// component to contain content of property group
const PropertyGroupContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 20px;
`

// component to contain content of property group
const PropertyCloseButton = styled.button`
  display: flex;
  flex-direction: row;
  margin: auto;
  margin-right: 0px;
  font-size: 16px;
  height: 20px;
  background: none;
  border: none;
  color: var(--iconButtonColor);

  &:hover {
    font-size: 20px;
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
}

// function to create property group view
const PropertyGroup = ({ name, description, children, onClose, ...rest }: Props) => {
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
