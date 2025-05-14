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

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import React from 'react'
import Modal from './index'

describe('Modal component', () => {
  beforeEach(() => {
    render(<Modal onSubmit={() => {}} />)
  })

  afterEach(() => {
    cleanup()
  })

  it('should render a container element with the data-testid attribute "modal"', () => {
    const modal = screen.getByTestId('modal')
    // @ts-expect-error
    expect(modal).toBeInTheDocument()
  })

  it('should render a button with the data-testid attribute "modal-cancel-button"', () => {
    const modalCancelButton = screen.getByTestId('modal-cancel-button')
    // @ts-expect-error
    expect(modalCancelButton).toBeInTheDocument()
  })

  it('should render a button with the data-testid attribute "modal-submit-button"', () => {
    screen.debug(document.body, Infinity)
    const modalSubmitButton = screen.getByTestId('modal-submit-button')
    // @ts-expect-error
    expect(modalSubmitButton).toBeInTheDocument()
  })
})
