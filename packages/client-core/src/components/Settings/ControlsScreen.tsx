import { useMutableState } from '@ir-engine/hyperflux'
import { isMobile } from '@ir-engine/spatial/src/common/functions/isMobile'
import { XRState } from '@ir-engine/spatial/src/xr/XRState'
import React from 'react'
import ControllerMappingImage from '../../user/menus/images/controller-mapping.png'
import KeyboardMappingImage from '../../user/menus/images/keyboard-mapping.png'
import MouseMappingImage from '../../user/menus/images/mouse-mapping.png'

export default function ControlsScreen() {
  const xrSupportedModes = useMutableState(XRState).supportedSessionModes
  const xrSupported = xrSupportedModes['immersive-ar'].value || xrSupportedModes['immersive-vr'].value

  return (
    <div className="flex flex-col">
      {!isMobile && !xrSupported && (
        <>
          <img
            src={KeyboardMappingImage}
            alt="Desktop Controls"
            className="mx-auto"
            data-testid="keyboard-controls-image"
          />
          <div className="mx-auto grid grid-cols-2">
            <img
              src={ControllerMappingImage}
              alt="Controller Controls"
              className="col-span-1"
              data-testid="controller-controls-image"
            />
            <img
              src={MouseMappingImage}
              alt="Controller Controls"
              className="col-span-1"
              data-testid="mouse-controls-image"
            />
          </div>
        </>
      )}
      {isMobile && <img src={ControllerMappingImage} alt="Mobile Controls" />}
    </div>
  )
}
