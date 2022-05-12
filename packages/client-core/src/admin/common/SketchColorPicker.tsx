import React, { useEffect, useState } from 'react'
import { SketchPicker } from 'react-color'

import { Button, Popover } from '@mui/material'

interface SketchColorPickerProps {
  name: string
  value: string
  onChange: Function
}

const SketchColorPicker = (props: SketchColorPickerProps) => {
  const [color, setColor] = useState(props.value)
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

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

  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  return (
    <div id={props.name}>
      <style>
        {`
          #${props.name} .color {
            margin: 0px;
            width: 36px;
            height: 14px;
            border-radius: 2px;
            background: ${color};
          }

          #${props.name} .swatch {
            padding: 5px;
            width: 46px;
            min-width: 46px;
            background: #fff;
            border-radius: 1px;
            display: inline-block;
            cursor: pointer;
          }
        `}
      </style>
      <Button className="swatch" onClick={handleClick}>
        <div className="color" />
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
      >
        <SketchPicker color={color} onChange={handleChange} />
      </Popover>
    </div>
  )
}

export default SketchColorPicker
