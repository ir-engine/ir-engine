import ProgressBar from '@ir-engine/client-core/src/systems/ui/LoadingDetailView/SimpleProgressBar'
import React from 'react'

export default function CompressedPublishConfirmation() {
  return (
    <div className="flex items-center justify-center">
      <div className="absolute z-50 w-[30vw] rounded-lg border border-gray-800 bg-surface-2  p-20 shadow-lg">
        <ProgressBar
          bgColor={'#ffffff'}
          completed={50}
          loopingBarWidth={50}
          height="4px"
          baseBgColor="#2F3137"
          isLabelVisible={false}
          isLooping={true}
          loopingBarSpeed={0.4}
        />
        <div className="mb-8 mt-6  flex justify-between text-sm text-white">
          <span>On Compressed Publish...</span>
          <span>Please Wait</span>
        </div>
      </div>
    </div>
  )
}
