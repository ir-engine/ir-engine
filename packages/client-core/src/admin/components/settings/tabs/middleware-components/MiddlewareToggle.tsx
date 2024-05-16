import Toggle from '@etherealengine/ui/src/primitives/tailwind/Toggle'
import React from 'react'

interface MiddlewareInputProps {
  mwLabel: string
  mwDefaultValue: boolean
  mwOnAction: (value: boolean) => void
}

const MiddlewareInput: React.FC<MiddlewareInputProps> = ({ mwLabel, mwDefaultValue, mwOnAction }) => {
  return (
    <Toggle
      containerClassName="justify-start col-span-full"
      label={mwLabel}
      value={mwDefaultValue || false}
      type="text"
      onChange={(e) => mwOnAction(e.target.value)}
    />
  )
}

export default MiddlewareToggle
