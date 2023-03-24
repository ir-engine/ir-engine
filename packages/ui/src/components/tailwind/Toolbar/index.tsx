import React from 'react'

import Button from '../../../primitives/tailwind/Button'

/**
 * Props for Toolbar component
 */
interface ToolbarProps {
  isRecording: any
  onToggleRecording: any
}

/**
 * Toolbar component
 */
const Toolbar = ({ isRecording, onToggleRecording }: ToolbarProps) => {
  return (
    <div className="flex items-center space-x-4 btn-group">
      <Button
        onClick={onToggleRecording}
        title={isRecording ? 'Recording' : 'Not Recording'}
        icon={<div className="w-5 h-5 bg-black rounded-full">&nbsp;</div>}
      />
    </div>
  )
}

Toolbar.defaultProps = {
  isRecording: null,
  onToggleRecording: () => {}
}

export default Toolbar
