import React, { ReactNode } from 'react'
import styled from 'styled-components'

/**
 * BlockFormField used to provide styles for block FormField div.
 *
 * @author Robert Long
 * @type {styled component}
 */
const BlockFormField = (styled as any).div`
  margin-bottom: 16px;

  label {
    display: block;
    margin-bottom: 8px;
  }
`

/**
 * InlineFormField used to provide styles for inline FormField div.
 *
 * @author Robert Long
 * @type {styled component}
 */
const InlineFormField = (styled as any).div`
  display: flex;
  justify-content: space-between;

  & > * {
    margin-left: 30px;
    align-self: center;
  }

  & > :first-child {
    margin-left: 0;
  }
`

interface FormFieldProp {
  inline?: any
  children?: ReactNode
}

/**
 * FormField function component used to render form fields.
 *
 * @author Robert Long
 * @param       {boolean} inline
 * @param       {string} children
 * @param       {any} rest
 * @constructor
 */
export function FormField({ inline, children, ...rest }: FormFieldProp) {
  if (inline) {
    return <InlineFormField {...rest}>{children}</InlineFormField>
  }

  return <BlockFormField {...rest}>{children}</BlockFormField>
}

export default FormField
