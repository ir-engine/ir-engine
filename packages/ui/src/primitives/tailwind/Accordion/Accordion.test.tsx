import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import React from 'react'
import Accordion from './index'

describe('MoreOptionsMenu component', () => {
  beforeEach(() => {
    render(
      // @ts-ignore
      <Accordion title="test" />
    )
  })

  afterEach(() => {
    cleanup()
  })

  it('should render a button with data-testid "accordion-header"', () => {
    const accordionHeader = screen.getByTestId('accordion-header')
    expect(accordionHeader).toBeInTheDocument()
  })
  it('should render a button with data-testid "open-accordion-icon" by default', () => {
    const openAccordionIcon = screen.getByTestId('open-accordion-icon')
    expect(openAccordionIcon).toBeInTheDocument()
  })
  it('should render a button with data-testid "close-accordion-icon" when the accordion is clicked', () => {
    const openAccordionIcon = screen.getByTestId('open-accordion-icon')
    fireEvent.click(openAccordionIcon)
    const closeAccordionIcon = screen.getByTestId('close-accordion-icon')
    expect(closeAccordionIcon).toBeInTheDocument()
  })
})
