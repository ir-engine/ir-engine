import React, { useEffect, useState } from 'react'
import { SketchPicker } from 'react-color'

interface SketchColorPickerProps {
  name: string
  value: string
  onChange: Function
}

const SketchColorPicker = (props: SketchColorPickerProps) => {
  const [color, setColor] = useState(props.value)
  const [displayColorPicker, setDisplayColorPicker] = useState(false)

  useEffect(() => {
    if (color !== props.value) {
      setColor(props.value)
    }
  }, [props.value])

  const handleChange = (color) => {
    const rgbaColor = `rgba(${color.rgb.r},${color.rgb.g},${color.rgb.b},${color.rgb.a})`

    setColor(rgbaColor)
    props.onChange(rgbaColor)
  }

  const handleClick = () => {
    setDisplayColorPicker(!displayColorPicker)
  }

  const handleClose = () => {
    setDisplayColorPicker(false)
  }

  return (
    <div id={props.name}>
      <style>
        {`
          #${props.name} .color {
            width: 36px;
            height: 14px;
            border-radius: 2px;
            background: ${color};
          }

          #${props.name} .swatch {
            padding: 5px;
            background: #fff;
            border-radius: 1px;
            boxShadow: 0 0 0 1px rgba(0,0,0,.1);
            display: inline-block;
            cursor: pointer;
          }

          #${props.name} .popover {
            position: absolute;
            zIndex: 2
          }

          #${props.name} .cover {
            position: fixed;
            top: 0px;
            right: 0px;
            bottom: 0px;
            left: 0px;
          }
        `}
      </style>
      <div className="swatch" onClick={handleClick}>
        <div className="color" />
      </div>
      {displayColorPicker ? (
        <div className="popover">
          <div className="cover" onClick={handleClose} />
          <SketchPicker color={color} onChange={handleChange} />
        </div>
      ) : null}
    </div>
  )
}

export default SketchColorPicker
