/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

/**
 * Returns a clamped value between min and max values
 * @param {Number} val : transformed value
 * @param {Number} min : minimum value
 * @param {Number} max : maximum value
 */
export const clamp = (val: number, min: number, max: number) => {
  return Math.max(Math.min(val, max), min)
}

/**
 * Returns a remapped value between 0 and 1 using min and max values
 * @param {Number} value : transformed value
 * @param {Number} min : minimum value
 * @param {Number} max : maximum value
 */
export const remap = (val: number, min: number, max: number) => {
  //returns min to max -> 0 to 1
  return (clamp(val, min, max) - min) / (max - min)
}

/** A set of default pose values in radians to serve as "rest" values */
export const RestingDefault = {
  Face: {
    eye: {
      l: 1,
      r: 1
    },
    mouth: {
      x: 0,
      y: 0,
      shape: {
        A: 0,
        E: 0,
        I: 0,
        O: 0,
        U: 0
      }
    },
    head: {
      x: 0,
      y: 0,
      z: 0,
      width: 0.3,
      height: 0.6,
      position: {
        x: 0.5,
        y: 0.5,
        z: 0
      }
    },
    brow: 0,
    pupil: {
      x: 0,
      y: 0
    }
  },
  Pose: {
    RightUpperArm: {
      x: 0,
      y: 0,
      z: -1.25
    },
    LeftUpperArm: {
      x: 0,
      y: 0,
      z: 1.25
    }, //y: 0 > -.5 // z: -.5>.5
    RightLowerArm: {
      x: 0,
      y: 0,
      z: 0
    },
    LeftLowerArm: {
      x: 0,
      y: 0,
      z: 0
    }, //x: 0 > -4, z: 0 to -.9
    LeftUpperLeg: {
      x: 0,
      y: 0,
      z: 0
    },
    RightUpperLeg: {
      x: 0,
      y: 0,
      z: 0
    },
    RightLowerLeg: {
      x: 0,
      y: 0,
      z: 0
    },
    LeftLowerLeg: {
      x: 0,
      y: 0,
      z: 0
    },
    LeftHand: {
      x: 0,
      y: 0,
      z: 0
    },
    RightHand: {
      x: 0,
      y: 0,
      z: 0
    },
    Spine: {
      x: 0,
      y: 0,
      z: 0
    },
    Hips: {
      position: {
        x: 0,
        y: 0,
        z: 0
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0
      }
    }
  },
  RightHand: {
    RightWrist: {
      x: -0.13,
      y: -0.07,
      z: -1.04
    },
    RightRingProximal: {
      x: 0,
      y: 0,
      z: -0.13
    },
    RightRingIntermediate: {
      x: 0,
      y: 0,
      z: -0.4
    },
    RightRingDistal: {
      x: 0,
      y: 0,
      z: -0.04
    },
    RightIndexProximal: {
      x: 0,
      y: 0,
      z: -0.24
    },
    RightIndexIntermediate: {
      x: 0,
      y: 0,
      z: -0.25
    },
    RightIndexDistal: {
      x: 0,
      y: 0,
      z: -0.06
    },
    RightMiddleProximal: {
      x: 0,
      y: 0,
      z: -0.09
    },
    RightMiddleIntermediate: {
      x: 0,
      y: 0,
      z: -0.44
    },
    RightMiddleDistal: {
      x: 0,
      y: 0,
      z: -0.06
    },
    RightThumbProximal: {
      x: -0.23,
      y: -0.33,
      z: -0.12
    },
    RightThumbIntermediate: {
      x: -0.2,
      y: -0.199,
      z: -0.0139
    },
    RightThumbDistal: {
      x: -0.2,
      y: 0.002,
      z: 0.15
    },
    RightLittleProximal: {
      x: 0,
      y: 0,
      z: -0.09
    },
    RightLittleIntermediate: {
      x: 0,
      y: 0,
      z: -0.225
    },
    RightLittleDistal: {
      x: 0,
      y: 0,
      z: -0.1
    }
  },
  LeftHand: {
    LeftWrist: {
      x: -0.13,
      y: -0.07,
      z: -1.04
    },
    LeftRingProximal: {
      x: 0,
      y: 0,
      z: 0.13
    },
    LeftRingIntermediate: {
      x: 0,
      y: 0,
      z: 0.4
    },
    LeftRingDistal: {
      x: 0,
      y: 0,
      z: 0.049
    },
    LeftIndexProximal: {
      x: 0,
      y: 0,
      z: 0.24
    },
    LeftIndexIntermediate: {
      x: 0,
      y: 0,
      z: 0.25
    },
    LeftIndexDistal: {
      x: 0,
      y: 0,
      z: 0.06
    },
    LeftMiddleProximal: {
      x: 0,
      y: 0,
      z: 0.09
    },
    LeftMiddleIntermediate: {
      x: 0,
      y: 0,
      z: 0.44
    },
    LeftMiddleDistal: {
      x: 0,
      y: 0,
      z: 0.066
    },
    LeftThumbProximal: {
      x: -0.23,
      y: 0.33,
      z: 0.12
    },
    LeftThumbIntermediate: {
      x: -0.2,
      y: 0.25,
      z: 0.05
    },
    LeftThumbDistal: {
      x: -0.2,
      y: 0.17,
      z: -0.06
    },
    LeftLittleProximal: {
      x: 0,
      y: 0,
      z: 0.17
    },
    LeftLittleIntermediate: {
      x: 0,
      y: 0,
      z: 0.4
    },
    LeftLittleDistal: {
      x: 0,
      y: 0,
      z: 0.1
    }
  }
}
