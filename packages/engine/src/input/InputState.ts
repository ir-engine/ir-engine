export type OldButtonTypes =
  /** Mouse */
  | 'PrimaryClick'
  | 'AuxiliaryClick'
  | 'SecondaryClick'

  /** Keyboard */
  | 'Backspace' // 8 backspace
  | 'Tab' // 9 tab
  | 'Enter' // 13 enter
  | 'ShiftLeft' // 16 shift (left)
  | 'ShiftRight' // 16 shift (right)
  | 'ControlLeft' // 17 ctrl (left)
  | 'ControlRight' // 17 ctrl (right)
  | 'AltLeft' // 18 alt (left)
  | 'AltRight' // 18 alt (right)
  | 'Pause' // 19 pause /break
  | 'CapsLock' // 20 caps  lock
  | 'Escape' // 27 escape
  | 'Space' // 32 space
  | 'PageUp' // 33 page up
  | 'PageDown' // 34 page down
  | 'End' // 35 end
  | 'Home' // 36 home
  | 'ArrowLeft' // 37 left arrow
  | 'ArrowUp' // 38 up arrow
  | 'ArrowRight' // 39 right arrow
  | 'ArrowDown' // 40 down arrow
  | 'PrintScreen' // 44 print screen
  | 'Insert' // 45 insert
  | 'Delete' // 46 delete
  | 'Digit0' // 48 0
  | 'Digit1' // 49 1
  | 'Digit2' // 50 2
  | 'Digit3' // 51 3
  | 'Digit4' // 52 4
  | 'Digit5' // 53 5
  | 'Digit6' // 54 6
  | 'Digit7' // 55 7
  | 'Digit8' // 56 8
  | 'Digit9' // 57 9
  | 'KeyA' // 65 a
  | 'KeyB' // 66 b
  | 'KeyC' // 67 c
  | 'KeyD' // 68 d
  | 'KeyE' // 69 e
  | 'KeyF' // 70 f
  | 'KeyG' // 71 g
  | 'KeyH' // 72 h
  | 'KeyI' // 73 i
  | 'KeyJ' // 74 j
  | 'KeyK' // 75 k
  | 'KeyL' // 76 l
  | 'KeyM' // 77 m
  | 'KeyN' // 78 n
  | 'KeyO' // 79 o
  | 'KeyP' // 80 p
  | 'KeyQ' // 81 q
  | 'KeyR' // 82 r
  | 'KeyS' // 83 s
  | 'KeyT' // 84 t
  | 'KeyU' // 85 u
  | 'KeyV' // 86 v
  | 'KeyW' // 87 w
  | 'KeyX' // 88 x
  | 'KeyY' // 89 y
  | 'KeyZ' // 90 z
  | 'MetaLeft' // 91 left windowkey
  | 'MetaRight' // 92 right windowkey
  | 'ContextMenu' // 93 select key
  | 'Numpad0' // 96 numpad 0
  | 'Numpad1' // 97 numpad 1
  | 'Numpad2' // 98 numpad 2
  | 'Numpad3' // 99 numpad 3
  | 'Numpad4' // 100 numpad 4
  | 'Numpad5' // 101 numpad 5
  | 'Numpad6' // 102 numpad 6
  | 'Numpad7' // 103 numpad 7
  | 'Numpad8' // 104 numpad 8
  | 'Numpad9' // 105 numpad 9
  | 'NumpadMultiply' // 106 multiply
  | 'NumpadAdd' // 107 add
  | 'NumpadSubtract' // 109 subtract
  | 'NumpadDecimal' // 110 decimal point
  | 'NumpadDivide' // 111 divide
  | 'F1' // 112 f1
  | 'F2' // 113 f2
  | 'F3' // 114 f3
  | 'F4' // 115 f4
  | 'F5' // 116 f5
  | 'F6' // 117 f6
  | 'F7' // 118 f7
  | 'F8' // 119 f8
  | 'F9' // 120 f9
  | 'F10' // 121 f10
  | 'F11' // 122 f11
  | 'F12' // 123 f12
  | 'NumLock' // 144 num lock
  | 'ScrollLock' // 145 scroll lock
  | 'AudioVolumeMute' // 173 audio volume mute
  | 'AudioVolumeDown' // 174 audio volume down
  | 'AudioVolumeUp' // 175 audio volume up
  | 'LaunchMediaPlayer' // 181 media player
  | 'LaunchApplication1' // 182 launch application 1
  | 'LaunchApplication2' // 183 launch application 2
  | 'Semicolon' // 186 semi - colon
  | 'Equal' // 187 equal sign
  | 'Comma' // 188 comma
  | 'Minus' // 189 dash
  | 'Period' // 190 period
  | 'Slash' // 191 forward slash
  | 'Backquote' // 192 Backquote / Grave accent
  | 'BracketLeft' // 219 open bracket
  | 'Backslash' // 220 back slash
  | 'BracketRight' // 221 close bracket
  | 'Quote' // 222 single quote

  /** WebXR Aliases */
  | 'LeftTrigger' // 0
  | 'LeftBumper' // 1
  | 'LeftPad' // 2
  | 'LeftStick' // 3
  | 'ButtonX' // 4
  | 'ButtonY' // 5
  | 'RightTrigger' // 0
  | 'RightBumper' // 1
  | 'RightPad' // 2
  | 'RightStick' // 3
  | 'ButtonA' // 4
  | 'ButtonB' // 5

export type ButtonType = {
  down: boolean
  pressed: boolean
  touched: boolean
  up: boolean
  value: number
}

export type OldButtonInputStateType = Partial<Record<OldButtonTypes, ButtonType>>

export type ButtonTypes =
  /** Mouse */
  | 'PrimaryClick'
  | 'AuxiliaryClick'
  | 'SecondaryClick'

  /** Keyboard */
  | 'Backspace' // 8 backspace
  | 'Tab' // 9 tab
  | 'Enter' // 13 enter
  | 'ShiftLeft' // 16 shift (left)
  | 'ShiftRight' // 16 shift (right)
  | 'ControlLeft' // 17 ctrl (left)
  | 'ControlRight' // 17 ctrl (right)
  | 'AltLeft' // 18 alt (left)
  | 'AltRight' // 18 alt (right)
  | 'Pause' // 19 pause /break
  | 'CapsLock' // 20 caps  lock
  | 'Escape' // 27 escape
  | 'Space' // 32 space
  | 'PageUp' // 33 page up
  | 'PageDown' // 34 page down
  | 'End' // 35 end
  | 'Home' // 36 home
  | 'ArrowLeft' // 37 left arrow
  | 'ArrowUp' // 38 up arrow
  | 'ArrowRight' // 39 right arrow
  | 'ArrowDown' // 40 down arrow
  | 'PrintScreen' // 44 print screen
  | 'Insert' // 45 insert
  | 'Delete' // 46 delete
  | 'Digit0' // 48 0
  | 'Digit1' // 49 1
  | 'Digit2' // 50 2
  | 'Digit3' // 51 3
  | 'Digit4' // 52 4
  | 'Digit5' // 53 5
  | 'Digit6' // 54 6
  | 'Digit7' // 55 7
  | 'Digit8' // 56 8
  | 'Digit9' // 57 9
  | 'KeyA' // 65 a
  | 'KeyB' // 66 b
  | 'KeyC' // 67 c
  | 'KeyD' // 68 d
  | 'KeyE' // 69 e
  | 'KeyF' // 70 f
  | 'KeyG' // 71 g
  | 'KeyH' // 72 h
  | 'KeyI' // 73 i
  | 'KeyJ' // 74 j
  | 'KeyK' // 75 k
  | 'KeyL' // 76 l
  | 'KeyM' // 77 m
  | 'KeyN' // 78 n
  | 'KeyO' // 79 o
  | 'KeyP' // 80 p
  | 'KeyQ' // 81 q
  | 'KeyR' // 82 r
  | 'KeyS' // 83 s
  | 'KeyT' // 84 t
  | 'KeyU' // 85 u
  | 'KeyV' // 86 v
  | 'KeyW' // 87 w
  | 'KeyX' // 88 x
  | 'KeyY' // 89 y
  | 'KeyZ' // 90 z
  | 'MetaLeft' // 91 left windowkey
  | 'MetaRight' // 92 right windowkey
  | 'ContextMenu' // 93 select key
  | 'Numpad0' // 96 numpad 0
  | 'Numpad1' // 97 numpad 1
  | 'Numpad2' // 98 numpad 2
  | 'Numpad3' // 99 numpad 3
  | 'Numpad4' // 100 numpad 4
  | 'Numpad5' // 101 numpad 5
  | 'Numpad6' // 102 numpad 6
  | 'Numpad7' // 103 numpad 7
  | 'Numpad8' // 104 numpad 8
  | 'Numpad9' // 105 numpad 9
  | 'NumpadMultiply' // 106 multiply
  | 'NumpadAdd' // 107 add
  | 'NumpadSubtract' // 109 subtract
  | 'NumpadDecimal' // 110 decimal point
  | 'NumpadDivide' // 111 divide
  | 'F1' // 112 f1
  | 'F2' // 113 f2
  | 'F3' // 114 f3
  | 'F4' // 115 f4
  | 'F5' // 116 f5
  | 'F6' // 117 f6
  | 'F7' // 118 f7
  | 'F8' // 119 f8
  | 'F9' // 120 f9
  | 'F10' // 121 f10
  | 'F11' // 122 f11
  | 'F12' // 123 f12
  | 'NumLock' // 144 num lock
  | 'ScrollLock' // 145 scroll lock
  | 'AudioVolumeMute' // 173 audio volume mute
  | 'AudioVolumeDown' // 174 audio volume down
  | 'AudioVolumeUp' // 175 audio volume up
  | 'LaunchMediaPlayer' // 181 media player
  | 'LaunchApplication1' // 182 launch application 1
  | 'LaunchApplication2' // 183 launch application 2
  | 'Semicolon' // 186 semi - colon
  | 'Equal' // 187 equal sign
  | 'Comma' // 188 comma
  | 'Minus' // 189 dash
  | 'Period' // 190 period
  | 'Slash' // 191 forward slash
  | 'Backquote' // 192 Backquote / Grave accent
  | 'BracketLeft' // 219 open bracket
  | 'Backslash' // 220 back slash
  | 'BracketRight' // 221 close bracket
  | 'Quote' // 222 single quote

  /** WebXR Aliases */
  | 'Trigger' // 0
  | 'Squeeze' // 1
  | 'Pad' // 2
  | 'Stick' // 3
  | 'ButtonA' // 4
  | 'ButtonB' // 5

export type ButtonInputStateType = Partial<Record<ButtonTypes, ButtonType>>

export const DefaultBooleanButtonArgs = Object.freeze({ down: true, pressed: true, touched: true, value: 1 })

export const createInitialButtonState = (initial: Readonly<Partial<ButtonType>> = DefaultBooleanButtonArgs) => {
  return {
    down: initial.down ?? initial.pressed ?? false,
    pressed: initial.pressed ?? true,
    touched: initial.touched ?? true,
    up: initial.up ?? false,
    value: initial.value ?? 1
  }
}
