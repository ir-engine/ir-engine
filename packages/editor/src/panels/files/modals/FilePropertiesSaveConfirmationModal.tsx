import ProgressBar from '@ir-engine/client-core/src/systems/ui/LoadingDetailView/SimpleProgressBar'
import React from 'react'
import { useTranslation } from 'react-i18next'

export default function FilePropertiesSaveConfirmationModal() {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-center">
      <div className="z-10  w-[30vw] rounded-lg border border-gray-800 bg-theme-surface-main p-20 shadow-lg">
        <ProgressBar
          bgColor={'#ffffff'}
          completed={50}
          loopingBarWidth={50}
          height="4px"
          baseBgColor="#000000"
          isLabelVisible={false}
          isLooping={true}
          loopingBarSpeed={0.4}
        />
        <div className="mb-8 mt-6  flex justify-between text-sm text-white">
          <span>Saving asset changes...</span>
          <span>Please Wait</span>
        </div>
      </div>
    </div>
  )
}
