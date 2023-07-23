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

import React, { CSSProperties, FC, HTMLProps, useCallback, useEffect, useRef, useState } from 'react'

export type AutoSizeInputProps = HTMLProps<HTMLInputElement> & {
  minWidth?: number
}

const baseStyles: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  visibility: 'hidden',
  height: 0,
  width: 'auto',
  whiteSpace: 'pre'
}

export const AutoSizeInput: FC<AutoSizeInputProps> = ({ minWidth = 30, ...props }) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const measureRef = useRef<HTMLSpanElement | null>(null)
  const [styles, setStyles] = useState<CSSProperties>({})

  // grab the font size of the input on ref mount
  const setRef = useCallback((input: HTMLInputElement | null) => {
    if (input) {
      const styles = window.getComputedStyle(input)
      setStyles({
        fontSize: styles.getPropertyValue('font-size'),
        paddingLeft: styles.getPropertyValue('padding-left'),
        paddingRight: styles.getPropertyValue('padding-right')
      })
    }
    inputRef.current = input
  }, [])

  // measure the text on change and update input
  useEffect(() => {
    if (measureRef.current === null) return
    if (inputRef.current === null) return

    const width = measureRef.current.clientWidth
    inputRef.current.style.width = Math.max(minWidth, width) + 'px'
  }, [props.value, minWidth, styles])

  return (
    <>
      <input ref={setRef} {...props} />
      <span ref={measureRef} style={{ ...baseStyles, ...styles }}>
        {props.value}
      </span>
    </>
  )
}
