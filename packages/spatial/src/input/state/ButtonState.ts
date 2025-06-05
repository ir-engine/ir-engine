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

import { Entity, UndefinedEntity } from '@ir-engine/ecs'
import { Quaternion, Vector2, Vector3 } from 'three'

/**
 * Button state
 */
export type ButtonState = {
  /** true for ONLY the first frame this button is down*/
  down: boolean

  /** true for every frame this button is down (including the frame it is released and up is true)*/
  pressed: boolean

  /** true if button is touched (e.g. capacitive touch, not the same as pressed/down)*/
  touched: boolean

  /** true for ONLY the first frame this button is up*/
  up: boolean

  /** current value of button (useful for triggers)*/
  value: number

  /** true if the input source is being moved while this button is pressed */
  dragging: boolean

  /** true if the input source is being rotated while this button is pressed */
  rotating: boolean

  /** position of the input source when this button was down */
  downPosition?: Vector3

  /** rotation of the input source when this button was down */
  downRotation?: Quaternion

  /** position of the input pointer when this button was down */
  downPointerPosition?: Vector2

  /** input source associated with this button state */
  inputSourceEntity: Entity

  /** indicates if this button is consumed for the current frame */
  consumed: Entity
}

/**
 * Mouse buttons
 */
export const MouseButton = {
  PrimaryClick: 'PrimaryClick' as const,
  AuxiliaryClick: 'AuxiliaryClick' as const,
  SecondaryClick: 'SecondaryClick' as const
}

export const MouseScroll = {
  HorizontalScroll: 0 as const,
  VerticalScroll: 1 as const
}

export type MouseButton = (typeof MouseButton)[keyof typeof MouseButton]
export type MouseScroll = (typeof MouseScroll)[keyof typeof MouseScroll]

/**
 * Keyboard button codes
 * https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code/code_values
 */
export const KeyboardButton = {
  Backspace: 'Backspace' as const, // 8 backspace
  Tab: 'Tab' as const, // 9 tab
  Enter: 'Enter' as const, // 13 enter
  ShiftLeft: 'ShiftLeft' as const, // 16 shift (left)
  ShiftRight: 'ShiftRight' as const, // 16 shift (right)
  ControlLeft: 'ControlLeft' as const, // 17 ctrl (left)
  ControlRight: 'ControlRight' as const, // 17 ctrl (right)
  AltLeft: 'AltLeft' as const, // 18 alt (left)
  AltRight: 'AltRight' as const, // 18 alt (right)
  Pause: 'Pause' as const, // 19 pause /break
  CapsLock: 'CapsLock' as const, // 20 caps  lock
  Escape: 'Escape' as const, // 27 escape
  Space: 'Space' as const, // 32 space
  PageUp: 'PageUp' as const, // 33 page up
  PageDown: 'PageDown' as const, // 34 page down
  End: 'End' as const, // 35 end
  Home: 'Home' as const, // 36 home
  ArrowLeft: 'ArrowLeft' as const, // 37 left arrow
  ArrowUp: 'ArrowUp' as const, // 38 up arrow
  ArrowRight: 'ArrowRight' as const, // 39 right arrow
  ArrowDown: 'ArrowDown' as const, // 40 down arrow
  PrintScreen: 'PrintScreen' as const, // 44 print screen
  Insert: 'Insert' as const, // 45 insert
  Delete: 'Delete' as const, // 46 delete
  Digit0: 'Digit0' as const, // 48 0
  Digit1: 'Digit1' as const, // 49 1
  Digit2: 'Digit2' as const, // 50 2
  Digit3: 'Digit3' as const, // 51 3
  Digit4: 'Digit4' as const, // 52 4
  Digit5: 'Digit5' as const, // 53 5
  Digit6: 'Digit6' as const, // 54 6
  Digit7: 'Digit7' as const, // 55 7
  Digit8: 'Digit8' as const, // 56 8
  Digit9: 'Digit9' as const, // 57 9
  KeyA: 'KeyA' as const, // 65 a
  KeyB: 'KeyB' as const, // 66 b
  KeyC: 'KeyC' as const, // 67 c
  KeyD: 'KeyD' as const, // 68 d
  KeyE: 'KeyE' as const, // 69 e
  KeyF: 'KeyF' as const, // 70 f
  KeyG: 'KeyG' as const, // 71 g
  KeyH: 'KeyH' as const, // 72 h
  KeyI: 'KeyI' as const, // 73 i
  KeyJ: 'KeyJ' as const, // 74 j
  KeyK: 'KeyK' as const, // 75 k
  KeyL: 'KeyL' as const, // 76 l
  KeyM: 'KeyM' as const, // 77 m
  KeyN: 'KeyN' as const, // 78 n
  KeyO: 'KeyO' as const, // 79 o
  KeyP: 'KeyP' as const, // 80 p
  KeyQ: 'KeyQ' as const, // 81 q
  KeyR: 'KeyR' as const, // 82 r
  KeyS: 'KeyS' as const, // 83 s
  KeyT: 'KeyT' as const, // 84 t
  KeyU: 'KeyU' as const, // 85 u
  KeyV: 'KeyV' as const, // 86 v
  KeyW: 'KeyW' as const, // 87 w
  KeyX: 'KeyX' as const, // 88 x
  KeyY: 'KeyY' as const, // 89 y
  KeyZ: 'KeyZ' as const, // 90 z
  MetaLeft: 'MetaLeft' as const, // 91 left windowkey
  MetaRight: 'MetaRight' as const, // 92 right windowkey
  ContextMenu: 'ContextMenu' as const, // 93 select key
  Numpad0: 'Numpad0' as const, // 96 numpad 0
  Numpad1: 'Numpad1' as const, // 97 numpad 1
  Numpad2: 'Numpad2' as const, // 98 numpad 2
  Numpad3: 'Numpad3' as const, // 99 numpad 3
  Numpad4: 'Numpad4' as const, // 100 numpad 4
  Numpad5: 'Numpad5' as const, // 101 numpad 5
  Numpad6: 'Numpad6' as const, // 102 numpad 6
  Numpad7: 'Numpad7' as const, // 103 numpad 7
  Numpad8: 'Numpad8' as const, // 104 numpad 8
  Numpad9: 'Numpad9' as const, // 105 numpad 9
  NumpadMultiply: 'NumpadMultiply' as const, // 106 multiply
  NumpadAdd: 'NumpadAdd' as const, // 107 add
  NumpadSubtract: 'NumpadSubtract' as const, // 109 subtract
  NumpadDecimal: 'NumpadDecimal' as const, // 110 decimal point
  NumpadDivide: 'NumpadDivide' as const, // 111 divide
  F1: 'F1' as const, // 112 f1
  F2: 'F2' as const, // 113 f2
  F3: 'F3' as const, // 114 f3
  F4: 'F4' as const, // 115 f4
  F5: 'F5' as const, // 116 f5
  F6: 'F6' as const, // 117 f6
  F7: 'F7' as const, // 118 f7
  F8: 'F8' as const, // 119 f8
  F9: 'F9' as const, // 120 f9
  F10: 'F10' as const, // 121 f10
  F11: 'F11' as const, // 122 f11
  F12: 'F12' as const, // 123 f12
  NumLock: 'NumLock' as const, // 144 num lock
  ScrollLock: 'ScrollLock' as const, // 145 scroll lock
  AudioVolumeMute: 'AudioVolumeMute' as const, // 173 audio volume mute
  AudioVolumeDown: 'AudioVolumeDown' as const, // 174 audio volume down
  AudioVolumeUp: 'AudioVolumeUp' as const, // 175 audio volume up
  LaunchMediaPlayer: 'LaunchMediaPlayer' as const, // 181 media player
  LaunchApplication1: 'LaunchApplication1' as const, // 182 launch application 1
  LaunchApplication2: 'LaunchApplication2' as const, // 183 launch application 2
  Semicolon: 'Semicolon' as const, // 186 semi - colon
  Equal: 'Equal' as const, // 187 equal sign
  Comma: 'Comma' as const, // 188 comma
  Minus: 'Minus' as const, // 189 dash
  Period: 'Period' as const, // 190 period
  Slash: 'Slash' as const, // 191 forward slash
  Backquote: 'Backquote' as const, // 192 Backquote / Grave accent
  BracketLeft: 'BracketLeft' as const, // 219 open bracket
  Backslash: 'Backslash' as const, // 220 back slash
  BracketRight: 'BracketRight' as const, // 221 close bracket
  Quote: 'Quote' as const // 222 single quote
}

/**
 * Standard gampepad button mapping
 * https://www.w3.org/TR/gamepad/#dfn-standard-gamepad
 */
export const StandardGamepadButton = {
  StandardGamepadButtonA: 0 as const, // X
  StandardGamepadButtonB: 1 as const, // Circle
  StandardGamepadButtonX: 2 as const, // Square
  StandardGamepadButtonY: 3 as const, // Triangle
  StandardGamepadLeft1: 4 as const,
  StandardGamepadRight1: 5 as const,
  StandardGamepadLeft2: 6 as const,
  StandardGamepadRight2: 7 as const,
  StandardGamepadButtonBack: 8 as const,
  StandardGamepadButtonStart: 9 as const,
  StandardGamepadLeftStick: 10 as const,
  StandardGamepadRightStick: 11 as const,
  StandardGamepadDPadUp: 12 as const,
  StandardGamepadDPadDown: 13 as const,
  StandardGamepadDPadLeft: 14 as const,
  StandardGamepadDPadRight: 15 as const,
  StandardGamepadButtonHome: 16 as const
}

export type StandardGamepadButton = (typeof StandardGamepadButton)[keyof typeof StandardGamepadButton]

export const StandardGamepadAxes = {
  StandardGamepadLeftStickX: 0 as const,
  StandardGamepadLeftStickY: 1 as const,
  StandardGamepadRightStickX: 2 as const,
  StandardGamepadRightStickY: 3 as const
}

export type StandardGamepadAxes = (typeof StandardGamepadAxes)[keyof typeof StandardGamepadAxes]

/**
 * XR standard gamepad button mapping
 * https://www.w3.org/TR/webxr-gamepads-module-1/#xr-standard-gamepad-mapping
 */
export const XRStandardGamepadButton = {
  XRStandardGamepadTrigger: 0 as const,
  XRStandardGamepadSqueeze: 1 as const,
  XRStandardGamepadPad: 2 as const,
  XRStandardGamepadStick: 3 as const,
  XRStandardGamepadButtonA: 4 as const,
  XRStandardGamepadButtonB: 5 as const
}

export type XRStandardGamepadButton = (typeof XRStandardGamepadButton)[keyof typeof XRStandardGamepadButton]

export const XRStandardGamepadAxes = {
  XRStandardGamepadTouchpadX: 0 as const,
  XRStandardGamepadTouchpadY: 1 as const,
  XRStandardGamepadThumbstickX: 2 as const,
  XRStandardGamepadThumbstickY: 3 as const
}

export type XRStandardGamepadAxes = (typeof XRStandardGamepadAxes)[keyof typeof XRStandardGamepadAxes]

export type AnyButton =
  | keyof typeof MouseButton
  | keyof typeof KeyboardButton
  | keyof typeof StandardGamepadButton
  | keyof typeof XRStandardGamepadButton
  | StandardGamepadButton
  | XRStandardGamepadButton
export type AnyAxis =
  | keyof typeof MouseScroll
  | keyof typeof StandardGamepadAxes
  | keyof typeof XRStandardGamepadAxes
  | MouseScroll
  | StandardGamepadAxes
  | XRStandardGamepadAxes

export type ButtonStateMap<A extends Record<string, any>> = Partial<
  Record<AnyButton | keyof A, ButtonState | undefined>
>
export type AxisValueMap<A extends Record<string, any>> = Partial<Record<AnyAxis | keyof A, number>>

export const ButtonMapping = {
  '': MouseButton,
  keyboard: KeyboardButton,
  standard: StandardGamepadButton,
  'xr-standard': XRStandardGamepadButton
} satisfies Record<GamepadMappingType | 'keyboard', Record<string, string | number>>

export const AxisMapping = {
  '': MouseScroll,
  'xr-standard': XRStandardGamepadAxes,
  standard: StandardGamepadAxes
} satisfies Record<GamepadMappingType, Record<string, string | number>>

export const DefaultBooleanButtonState = Object.freeze({
  down: true,
  pressed: true,
  touched: true,
  value: 1,
  dragging: false,
  rotating: false
}) as ButtonState

export const createInitialButtonState = (
  inputSourceEntity: Entity,
  initial: Readonly<Partial<ButtonState>> = DefaultBooleanButtonState
) => {
  return {
    down: initial.down ?? initial.pressed ?? false,
    pressed: initial.pressed ?? true,
    touched: initial.touched ?? true,
    dragging: initial.dragging ?? false,
    rotating: initial.rotating ?? false,
    up: initial.up ?? false,
    value: initial.value ?? 1,
    inputSourceEntity,
    downPosition: initial.downPosition ?? undefined,
    downRotation: initial.downRotation ?? undefined,
    downPointerPosition: initial.downPointerPosition ?? undefined,
    consumed: UndefinedEntity
  } as ButtonState
}
