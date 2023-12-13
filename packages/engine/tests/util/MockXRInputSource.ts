
export class MockXRInputSource extends XRInputSource
{
  constructor(options: {
    handedness: XRHandedness,
    targetRayMode: XRTargetRayMode,
    targetRaySpace: XRSpace,
    gripSpace?: XRSpace | undefined,
    gamepad?: Gamepad | undefined,
    profiles: string[],
    hand?: XRHand | undefined,
  }) {
    super();
    for (const key in options) {
      this[key] = options[key]
    }
  }
}

export class MockXRSpace extends XRSpace
{

}