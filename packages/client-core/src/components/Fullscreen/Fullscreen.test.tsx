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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createEngine, destroyEngine } from '@ir-engine/ecs'
import React from 'react'
import { Fullscreen } from './index'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

describe('MoreOptionsMenu component', () => {
  let fullscreenElement: HTMLElement | null = null
  beforeEach(() => {
    createEngine()

    // Mock requestFullscreen
    Object.defineProperty(document.body, 'requestFullscreen', {
      configurable: true,
      value: vi.fn().mockImplementation(() => {
        fullscreenElement = document.body
        Object.defineProperty(document, 'fullscreenElement', {
          configurable: true,
          get: () => fullscreenElement
        })
        document.dispatchEvent(new Event('fullscreenchange'))
        return Promise.resolve()
      })
    })

    // Mock exitFullscreen
    Object.defineProperty(document, 'exitFullscreen', {
      configurable: true,
      value: vi.fn().mockImplementation(() => {
        fullscreenElement = null
        Object.defineProperty(document, 'fullscreenElement', {
          configurable: true,
          get: () => fullscreenElement
        })
        document.dispatchEvent(new Event('fullscreenchange'))
        return Promise.resolve()
      })
    })

    render(<Fullscreen />)
  })

  afterEach(() => {
    destroyEngine()
    cleanup()
  })

  it('should render a button with data-testid "enter-fullscreen-button"', () => {
    const fullscreenButton = screen.getByTestId('enter-fullscreen-button')
    // @ts-expect-error
    expect(fullscreenButton).toBeInTheDocument()
  })

  it('should render a button with data-testid "exit-fullscreen-button" after full screen mode is activated', () => {
    const fullscreenButton = screen.getByTestId('enter-fullscreen-button')
    fireEvent.click(fullscreenButton)

    screen.debug(document.body, Infinity)
    const exitFullscreenButton = screen.getByTestId('exit-fullscreen-button')
    // @ts-expect-error
    expect(exitFullscreenButton).toBeInTheDocument()
  })
})
