import { Component, Types } from "ecsy";

export class VRInputState extends Component {}
VRInputState.schema = {
  id: { default: 0, type: Types.Number },
  controller: { default: null, type: Types.Object }
};

export class VRInputBehaviour extends Component {}
VRInputBehaviour.schema = {
  select: { default: null, type: Types.Object },
  selectstart: { default: null, type: Types.Object },
  selectend: { default: null, type: Types.Object },

  connected: { default: null, type: Types.Object },
  disconnected: { default: null, type: Types.Object },

  squeeze: { default: null, type: Types.Object },
  squeezestart: { default: null, type: Types.Object },
  squeezeend: { default: null, type: Types.Object }
};
