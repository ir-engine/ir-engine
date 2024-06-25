/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { Entity, UndefinedEntity } from '@etherealengine/ecs'
import { Quaternion, Vector3 } from 'three'

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

  /** true for every frame this button is being dragged*/
  dragging: boolean

  /** true for every frame this button is being rotated*/
  rotating: boolean

  /** position when this button down was true of either InputPointerComponent.position OR the Transform.position if an XRInputSource */
  downPosition?: Vector3

  /** rotation when this button down was true of the Transform.position if XRInputSource */
  downRotation?: Quaternion

  /** input source associated with this button state */
  inputSource: Entity
}

/**
 * Mouse buttons
 */
export enum MouseButton {
  'PrimaryClick' = 'PrimaryClick',
  'AuxiliaryClick' = 'AuxiliaryClick',
  'SecondaryClick' = 'SecondaryClick'
}

export enum MouseScroll {
  'HorizontalScroll' = 'HorizontalScroll',
  'VerticalScroll' = 'VerticalScroll'
}

/**
 * Keyboard button codes
 * https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code/code_values
 */
export enum KeyboardButton {
  'Backspace' = 'Backspace', // 8 backspace
  'Tab' = 'Tab', // 9 tab
  'Enter' = 'Enter', // 13 enter
  'ShiftLeft' = 'ShiftLeft', // 16 shift (left)
  'ShiftRight' = 'ShiftRight', // 16 shift (right)
  'ControlLeft' = 'ControlLeft', // 17 ctrl (left)
  'ControlRight' = 'ControlRight', // 17 ctrl (right)
  'AltLeft' = 'AltLeft', // 18 alt (left)
  'AltRight' = 'AltRight', // 18 alt (right)
  'Pause' = 'Pause', // 19 pause /break
  'CapsLock' = 'CapsLock', // 20 caps  lock
  'Escape' = 'Escape', // 27 escape
  'Space' = 'Space', // 32 space
  'PageUp' = 'PageUp', // 33 page up
  'PageDown' = 'PageDown', // 34 page down
  'End' = 'End', // 35 end
  'Home' = 'Home', // 36 home
  'ArrowLeft' = 'ArrowLeft', // 37 left arrow
  'ArrowUp' = 'ArrowUp', // 38 up arrow
  'ArrowRight' = 'ArrowRight', // 39 right arrow
  'ArrowDown' = 'ArrowDown', // 40 down arrow
  'PrintScreen' = 'PrintScreen', // 44 print screen
  'Insert' = 'Insert', // 45 insert
  'Delete' = 'Delete', // 46 delete
  'Digit0' = 'Digit0', // 48 0
  'Digit1' = 'Digit1', // 49 1
  'Digit2' = 'Digit2', // 50 2
  'Digit3' = 'Digit3', // 51 3
  'Digit4' = 'Digit4', // 52 4
  'Digit5' = 'Digit5', // 53 5
  'Digit6' = 'Digit6', // 54 6
  'Digit7' = 'Digit7', // 55 7
  'Digit8' = 'Digit8', // 56 8
  'Digit9' = 'Digit9', // 57 9
  'KeyA' = 'KeyA', // 65 a
  'KeyB' = 'KeyB', // 66 b
  'KeyC' = 'KeyC', // 67 c
  'KeyD' = 'KeyD', // 68 d
  'KeyE' = 'KeyE', // 69 e
  'KeyF' = 'KeyF', // 70 f
  'KeyG' = 'KeyG', // 71 g
  'KeyH' = 'KeyH', // 72 h
  'KeyI' = 'KeyI', // 73 i
  'KeyJ' = 'KeyJ', // 74 j
  'KeyK' = 'KeyK', // 75 k
  'KeyL' = 'KeyL', // 76 l
  'KeyM' = 'KeyM', // 77 m
  'KeyN' = 'KeyN', // 78 n
  'KeyO' = 'KeyO', // 79 o
  'KeyP' = 'KeyP', // 80 p
  'KeyQ' = 'KeyQ', // 81 q
  'KeyR' = 'KeyR', // 82 r
  'KeyS' = 'KeyS', // 83 s
  'KeyT' = 'KeyT', // 84 t
  'KeyU' = 'KeyU', // 85 u
  'KeyV' = 'KeyV', // 86 v
  'KeyW' = 'KeyW', // 87 w
  'KeyX' = 'KeyX', // 88 x
  'KeyY' = 'KeyY', // 89 y
  'KeyZ' = 'KeyZ', // 90 z
  'MetaLeft' = 'MetaLeft', // 91 left windowkey
  'MetaRight' = 'MetaRight', // 92 right windowkey
  'ContextMenu' = 'ContextMenu', // 93 select key
  'Numpad0' = 'Numpad0', // 96 numpad 0
  'Numpad1' = 'Numpad1', // 97 numpad 1
  'Numpad2' = 'Numpad2', // 98 numpad 2
  'Numpad3' = 'Numpad3', // 99 numpad 3
  'Numpad4' = 'Numpad4', // 100 numpad 4
  'Numpad5' = 'Numpad5', // 101 numpad 5
  'Numpad6' = 'Numpad6', // 102 numpad 6
  'Numpad7' = 'Numpad7', // 103 numpad 7
  'Numpad8' = 'Numpad8', // 104 numpad 8
  'Numpad9' = 'Numpad9', // 105 numpad 9
  'NumpadMultiply' = 'NumpadMultiply', // 106 multiply
  'NumpadAdd' = 'NumpadAdd', // 107 add
  'NumpadSubtract' = 'NumpadSubtract', // 109 subtract
  'NumpadDecimal' = 'NumpadDecimal', // 110 decimal point
  'NumpadDivide' = 'NumpadDivide', // 111 divide
  'F1' = 'F1', // 112 f1
  'F2' = 'F2', // 113 f2
  'F3' = 'F3', // 114 f3
  'F4' = 'F4', // 115 f4
  'F5' = 'F5', // 116 f5
  'F6' = 'F6', // 117 f6
  'F7' = 'F7', // 118 f7
  'F8' = 'F8', // 119 f8
  'F9' = 'F9', // 120 f9
  'F10' = 'F10', // 121 f10
  'F11' = 'F11', // 122 f11
  'F12' = 'F12', // 123 f12
  'NumLock' = 'NumLock', // 144 num lock
  'ScrollLock' = 'ScrollLock', // 145 scroll lock
  'AudioVolumeMute' = 'AudioVolumeMute', // 173 audio volume mute
  'AudioVolumeDown' = 'AudioVolumeDown', // 174 audio volume down
  'AudioVolumeUp' = 'AudioVolumeUp', // 175 audio volume up
  'LaunchMediaPlayer' = 'LaunchMediaPlayer', // 181 media player
  'LaunchApplication1' = 'LaunchApplication1', // 182 launch application 1
  'LaunchApplication2' = 'LaunchApplication2', // 183 launch application 2
  'Semicolon' = 'Semicolon', // 186 semi - colon
  'Equal' = 'Equal', // 187 equal sign
  'Comma' = 'Comma', // 188 comma
  'Minus' = 'Minus', // 189 dash
  'Period' = 'Period', // 190 period
  'Slash' = 'Slash', // 191 forward slash
  'Backquote' = 'Backquote', // 192 Backquote / Grave accent
  'BracketLeft' = 'BracketLeft', // 219 open bracket
  'Backslash' = 'Backslash', // 220 back slash
  'BracketRight' = 'BracketRight', // 221 close bracket
  'Quote' = 'Quote' // 222 single quote
}

/**
 * Standard gampepad button mapping
 * https://www.w3.org/TR/gamepad/#dfn-standard-gamepad
 */
export enum StandardGamepadButton {
  'StandardGamepadButtonA' = 0, // X
  'StandardGamepadButtonB' = 1, // Circle
  'StandardGamepadButtonX' = 2, // Square
  'StandardGamepadButtonY' = 3, // Triangle
  'StandardGamepadLeft1' = 4,
  'StandardGamepadRight1' = 5,
  'StandardGamepadLeft2' = 6,
  'StandardGamepadRight2' = 7,
  'StandardGamepadButtonBack' = 8,
  'StandardGamepadButtonStart' = 9,
  'StandardGamepadLeftStick' = 10,
  'StandardGamepadRightStick' = 11,
  'StandardGamepadDPadUp' = 12,
  'StandardGamepadDPadDown' = 13,
  'StandardGamepadDPadLeft' = 14,
  'StandardGamepadDPadRight' = 15,
  'StandardGamepadButtonHome' = 16
}

export enum StandardGamepadAxes {
  'StandardGamepadLeftStickX' = 0,
  'StandardGamepadLeftStickY' = 1,
  'StandardGamepadRightStickX' = 2,
  'StandardGamepadRightStickY' = 3
}

/**
 * XR standard gamepad button mapping
 * https://www.w3.org/TR/webxr-gamepads-module-1/#xr-standard-gamepad-mapping
 */
export enum XRStandardGamepadButton {
  'XRStandardGamepadTrigger' = 0,
  'XRStandardGamepadSqueeze' = 1,
  'XRStandardGamepadPad' = 2,
  'XRStandardGamepadStick' = 3,
  'XRStandardGamepadButtonA' = 4,
  'XRStandardGamepadButtonB' = 5
}

export enum XRStandardGamepadAxes {
  'XRStandardGamepadTouchpadX' = 0,
  'XRStandardGamepadTouchpadY' = 1,
  'XRStandardGamepadThumbstickX' = 2,
  'XRStandardGamepadThumbstickY' = 3
}

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
  | StandardGamepadAxes
  | XRStandardGamepadAxes

export type ButtonStateMap<A extends Record<string, any>> = Partial<
  Record<AnyButton | keyof A, ButtonState | undefined>
>
export type AxisValueMap<A extends Record<string, any> = {}> = Partial<Record<AnyAxis | keyof A, number>>

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
})

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
    inputSource: inputSourceEntity ?? UndefinedEntity
  }
}
