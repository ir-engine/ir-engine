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

import '@testing-library/jest-dom'
import { cleanup, render, type RenderResult, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, type TestContext } from 'vitest'

import React from 'react'
import EditorDropdownItem from './index'

interface EditorDropdownItemContext extends TestContext {
  rerender: RenderResult['rerender']
}

describe('EditorDropdownItem component', () => {
  beforeEach<EditorDropdownItemContext>((context) => {
    const { rerender } = render(<EditorDropdownItem label="assets-panel-category" collapsed={true} />)
    context.rerender = rerender
  })
  afterEach(() => {
    cleanup()
  })

  it('should render an element container with the data-testid attribute "assets-panel-category"', () => {
    const container = screen.getByTestId('assets-panel-category')
    expect(container).toBeInTheDocument()
  })

  it('should render an element with the data-testid attribute "item-name"', () => {
    const itemName = screen.getByTestId('item-name')
    expect(itemName).toBeInTheDocument()
  })

  it('should render an element with the data-testid attribute "expand-item" when "collapsed" state is true', () => {
    const expandItemIcon = screen.getByTestId('expand-item')
    expect(expandItemIcon).toBeInTheDocument()
  })

  it('should render an element with the data-testid attribute "collapse-item" when "collapsed" state is false', (context: EditorDropdownItemContext) => {
    context.rerender(<EditorDropdownItem label="assets-panel-category" collapsed={false} />)

    const collapseItemIcon = screen.getByTestId('collapse-item')
    expect(collapseItemIcon).toBeInTheDocument()
  })
})
