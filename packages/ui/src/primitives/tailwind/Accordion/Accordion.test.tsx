/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

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
