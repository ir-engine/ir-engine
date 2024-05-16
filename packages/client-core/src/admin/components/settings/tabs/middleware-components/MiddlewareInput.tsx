import Input from '@etherealengine/ui/src/primitives/tailwind/Input'
import React from 'react'

interface MiddlewareInputProps {
  mwLabel: string
  mwDefaultValue: string
  mwOnAction: (value: string) => void
}

const MiddlewareInput: React.FC<MiddlewareInputProps> = ({ mwLabel, mwDefaultValue, mwOnAction }) => {
  return (
    <Input
      className="col-span-1"
      label={mwLabel}
      defaultValue={mwDefaultValue || ''}
      type="text"
      onChange={(e) => mwOnAction(e.target.value)}
    />
  )
}

export default MiddlewareInput
