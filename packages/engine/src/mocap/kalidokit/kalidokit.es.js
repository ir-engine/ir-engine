/**
 * @kalidokit v1.1.5
 * Blendshape and kinematics calculator for Mediapipe/Tensorflow.js Face, Eyes, Pose, and Finger tracking models.
 * 
 * @license
 * Copyright (c) 2020-2021 yeemachine
 * SPDX-License-Idntifier: MIT 
 * https://github.com/yeemachine/kalidokit#readme
 */
const clamp = (val, min, max) => {
  return Math.max(Math.min(val, max), min);
};
const remap = (val, min, max) => {
  return (clamp(val, min, max) - min) / (max - min);
};
const RestingDefault = {
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
    },
    RightLowerArm: {
      x: 0,
      y: 0,
      z: 0
    },
    LeftLowerArm: {
      x: 0,
      y: 0,
      z: 0
    },
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
      y: 2e-3,
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
};
var helpers = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  clamp,
  remap,
  RestingDefault
});
const RIGHT = "Right";
const LEFT = "Left";
const PI = Math.PI;
const TWO_PI = Math.PI * 2;
class Vector {
  constructor(a, b, c) {
    var _a, _b, _c, _d, _e, _f;
    if (Array.isArray(a)) {
      this.x = (_a = a[0]) != null ? _a : 0;
      this.y = (_b = a[1]) != null ? _b : 0;
      this.z = (_c = a[2]) != null ? _c : 0;
      return;
    }
    if (!!a && typeof a === "object") {
      this.x = (_d = a.x) != null ? _d : 0;
      this.y = (_e = a.y) != null ? _e : 0;
      this.z = (_f = a.z) != null ? _f : 0;
      return;
    }
    this.x = a != null ? a : 0;
    this.y = b != null ? b : 0;
    this.z = c != null ? c : 0;
  }
  negative() {
    return new Vector(-this.x, -this.y, -this.z);
  }
  add(v) {
    if (v instanceof Vector)
      return new Vector(this.x + v.x, this.y + v.y, this.z + v.z);
    else
      return new Vector(this.x + v, this.y + v, this.z + v);
  }
  subtract(v) {
    if (v instanceof Vector)
      return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
    else
      return new Vector(this.x - v, this.y - v, this.z - v);
  }
  multiply(v) {
    if (v instanceof Vector)
      return new Vector(this.x * v.x, this.y * v.y, this.z * v.z);
    else
      return new Vector(this.x * v, this.y * v, this.z * v);
  }
  divide(v) {
    if (v instanceof Vector)
      return new Vector(this.x / v.x, this.y / v.y, this.z / v.z);
    else
      return new Vector(this.x / v, this.y / v, this.z / v);
  }
  equals(v) {
    return this.x == v.x && this.y == v.y && this.z == v.z;
  }
  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }
  cross(v) {
    return new Vector(this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x);
  }
  length() {
    return Math.sqrt(this.dot(this));
  }
  distance(v, d = 3) {
    if (d === 2)
      return Math.sqrt(Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2));
    else
      return Math.sqrt(Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2) + Math.pow(this.z - v.z, 2));
  }
  lerp(v, fraction) {
    return v.subtract(this).multiply(fraction).add(this);
  }
  unit() {
    return this.divide(this.length());
  }
  min() {
    return Math.min(Math.min(this.x, this.y), this.z);
  }
  max() {
    return Math.max(Math.max(this.x, this.y), this.z);
  }
  toSphericalCoords(axisMap = { x: "x", y: "y", z: "z" }) {
    return {
      theta: Math.atan2(this[axisMap.y], this[axisMap.x]),
      phi: Math.acos(this[axisMap.z] / this.length())
    };
  }
  angleTo(a) {
    return Math.acos(this.dot(a) / (this.length() * a.length()));
  }
  toArray(n) {
    return [this.x, this.y, this.z].slice(0, n || 3);
  }
  clone() {
    return new Vector(this.x, this.y, this.z);
  }
  init(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }
  static negative(a, b = new Vector()) {
    b.x = -a.x;
    b.y = -a.y;
    b.z = -a.z;
    return b;
  }
  static add(a, b, c = new Vector()) {
    if (b instanceof Vector) {
      c.x = a.x + b.x;
      c.y = a.y + b.y;
      c.z = a.z + b.z;
    } else {
      c.x = a.x + b;
      c.y = a.y + b;
      c.z = a.z + b;
    }
    return c;
  }
  static subtract(a, b, c = new Vector()) {
    if (b instanceof Vector) {
      c.x = a.x - b.x;
      c.y = a.y - b.y;
      c.z = a.z - b.z;
    } else {
      c.x = a.x - b;
      c.y = a.y - b;
      c.z = a.z - b;
    }
    return c;
  }
  static multiply(a, b, c = new Vector()) {
    if (b instanceof Vector) {
      c.x = a.x * b.x;
      c.y = a.y * b.y;
      c.z = a.z * b.z;
    } else {
      c.x = a.x * b;
      c.y = a.y * b;
      c.z = a.z * b;
    }
    return c;
  }
  static divide(a, b, c = new Vector()) {
    if (b instanceof Vector) {
      c.x = a.x / b.x;
      c.y = a.y / b.y;
      c.z = a.z / b.z;
    } else {
      c.x = a.x / b;
      c.y = a.y / b;
      c.z = a.z / b;
    }
    return c;
  }
  static cross(a, b, c = new Vector()) {
    c.x = a.y * b.z - a.z * b.y;
    c.y = a.z * b.x - a.x * b.z;
    c.z = a.x * b.y - a.y * b.x;
    return c;
  }
  static unit(a, b) {
    const length = a.length();
    b.x = a.x / length;
    b.y = a.y / length;
    b.z = a.z / length;
    return b;
  }
  static fromAngles(theta, phi) {
    return new Vector(Math.cos(theta) * Math.cos(phi), Math.sin(phi), Math.sin(theta) * Math.cos(phi));
  }
  static randomDirection() {
    return Vector.fromAngles(Math.random() * TWO_PI, Math.asin(Math.random() * 2 - 1));
  }
  static min(a, b) {
    return new Vector(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.min(a.z, b.z));
  }
  static max(a, b) {
    return new Vector(Math.max(a.x, b.x), Math.max(a.y, b.y), Math.max(a.z, b.z));
  }
  static lerp(a, b, fraction) {
    if (b instanceof Vector) {
      return b.subtract(a).multiply(fraction).add(a);
    } else {
      return (b - a) * fraction + a;
    }
  }
  static fromArray(a) {
    if (Array.isArray(a)) {
      return new Vector(a[0], a[1], a[2]);
    }
    return new Vector(a.x, a.y, a.z);
  }
  static angleBetween(a, b) {
    return a.angleTo(b);
  }
  static distance(a, b, d) {
    if (d === 2)
      return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    else
      return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2));
  }
  static toDegrees(a) {
    return a * (180 / PI);
  }
  static normalizeAngle(radians) {
    let angle = radians % TWO_PI;
    angle = angle > PI ? angle - TWO_PI : angle < -PI ? TWO_PI + angle : angle;
    return angle / PI;
  }
  static normalizeRadians(radians) {
    if (radians >= PI / 2) {
      radians -= TWO_PI;
    }
    if (radians <= -PI / 2) {
      radians += TWO_PI;
      radians = PI - radians;
    }
    return radians / PI;
  }
  static find2DAngle(cx, cy, ex, ey) {
    const dy = ey - cy;
    const dx = ex - cx;
    const theta = Math.atan2(dy, dx);
    return theta;
  }
  static findRotation(a, b, normalize = true) {
    if (normalize) {
      return new Vector(Vector.normalizeRadians(Vector.find2DAngle(a.z, a.x, b.z, b.x)), Vector.normalizeRadians(Vector.find2DAngle(a.z, a.y, b.z, b.y)), Vector.normalizeRadians(Vector.find2DAngle(a.x, a.y, b.x, b.y)));
    } else {
      return new Vector(Vector.find2DAngle(a.z, a.x, b.z, b.x), Vector.find2DAngle(a.z, a.y, b.z, b.y), Vector.find2DAngle(a.x, a.y, b.x, b.y));
    }
  }
  static rollPitchYaw(a, b, c) {
    if (!c) {
      return new Vector(Vector.normalizeAngle(Vector.find2DAngle(a.z, a.y, b.z, b.y)), Vector.normalizeAngle(Vector.find2DAngle(a.z, a.x, b.z, b.x)), Vector.normalizeAngle(Vector.find2DAngle(a.x, a.y, b.x, b.y)));
    }
    const qb = b.subtract(a);
    const qc = c.subtract(a);
    const n = qb.cross(qc);
    const unitZ = n.unit();
    const unitX = qb.unit();
    const unitY = unitZ.cross(unitX);
    const beta = Math.asin(unitZ.x) || 0;
    const alpha = Math.atan2(-unitZ.y, unitZ.z) || 0;
    const gamma = Math.atan2(-unitY.x, unitX.x) || 0;
    return new Vector(Vector.normalizeAngle(alpha), Vector.normalizeAngle(beta), Vector.normalizeAngle(gamma));
  }
  static angleBetween3DCoords(a, b, c) {
    if (!(a instanceof Vector)) {
      a = new Vector(a);
      b = new Vector(b);
      c = new Vector(c);
    }
    const v1 = a.subtract(b);
    const v2 = c.subtract(b);
    const v1norm = v1.unit();
    const v2norm = v2.unit();
    const dotProducts = v1norm.dot(v2norm);
    const angle = Math.acos(dotProducts);
    return Vector.normalizeRadians(angle);
  }
  static getRelativeSphericalCoords(a, b, c, axisMap) {
    if (!(a instanceof Vector)) {
      a = new Vector(a);
      b = new Vector(b);
      c = new Vector(c);
    }
    const v1 = b.subtract(a);
    const v2 = c.subtract(b);
    const v1norm = v1.unit();
    const v2norm = v2.unit();
    const { theta: theta1, phi: phi1 } = v1norm.toSphericalCoords(axisMap);
    const { theta: theta2, phi: phi2 } = v2norm.toSphericalCoords(axisMap);
    const theta = theta1 - theta2;
    const phi = phi1 - phi2;
    return {
      theta: Vector.normalizeAngle(theta),
      phi: Vector.normalizeAngle(phi)
    };
  }
  static getSphericalCoords(a, b, axisMap = { x: "x", y: "y", z: "z" }) {
    if (!(a instanceof Vector)) {
      a = new Vector(a);
      b = new Vector(b);
    }
    const v1 = b.subtract(a);
    const v1norm = v1.unit();
    const { theta, phi } = v1norm.toSphericalCoords(axisMap);
    return {
      theta: Vector.normalizeAngle(-theta),
      phi: Vector.normalizeAngle(PI / 2 - phi)
    };
  }
}
const calcArms = (lm) => {
  const UpperArm = {
    r: Vector.findRotation(lm[11], lm[13]),
    l: Vector.findRotation(lm[12], lm[14])
  };
  UpperArm.r.y = Vector.angleBetween3DCoords(lm[12], lm[11], lm[13]);
  UpperArm.l.y = Vector.angleBetween3DCoords(lm[11], lm[12], lm[14]);
  const LowerArm = {
    r: Vector.findRotation(lm[13], lm[15]),
    l: Vector.findRotation(lm[14], lm[16])
  };
  LowerArm.r.y = Vector.angleBetween3DCoords(lm[11], lm[13], lm[15]);
  LowerArm.l.y = Vector.angleBetween3DCoords(lm[12], lm[14], lm[16]);
  LowerArm.r.z = clamp(LowerArm.r.z, -2.14, 0);
  LowerArm.l.z = clamp(LowerArm.l.z, -2.14, 0);
  const Hand = {
    r: Vector.findRotation(Vector.fromArray(lm[15]), Vector.lerp(Vector.fromArray(lm[17]), Vector.fromArray(lm[19]), 0.5)),
    l: Vector.findRotation(Vector.fromArray(lm[16]), Vector.lerp(Vector.fromArray(lm[18]), Vector.fromArray(lm[20]), 0.5))
  };
  const rightArmRig = rigArm(UpperArm.r, LowerArm.r, Hand.r, RIGHT);
  const leftArmRig = rigArm(UpperArm.l, LowerArm.l, Hand.l, LEFT);
  return {
    UpperArm: {
      r: rightArmRig.UpperArm,
      l: leftArmRig.UpperArm
    },
    LowerArm: {
      r: rightArmRig.LowerArm,
      l: leftArmRig.LowerArm
    },
    Hand: {
      r: rightArmRig.Hand,
      l: leftArmRig.Hand
    },
    Unscaled: {
      UpperArm,
      LowerArm,
      Hand
    }
  };
};
const rigArm = (UpperArm, LowerArm, Hand, side = RIGHT) => {
  const invert = side === RIGHT ? 1 : -1;
  UpperArm.z *= -2.3 * invert;
  UpperArm.y *= PI * invert;
  UpperArm.y -= Math.max(LowerArm.x);
  UpperArm.y -= -invert * Math.max(LowerArm.z, 0);
  UpperArm.x -= 0.3 * invert;
  LowerArm.z *= -2.14 * invert;
  LowerArm.y *= 2.14 * invert;
  LowerArm.x *= 2.14 * invert;
  UpperArm.x = clamp(UpperArm.x, -0.5, PI);
  LowerArm.x = clamp(LowerArm.x, -0.3, 0.3);
  Hand.y = clamp(Hand.z * 2, -0.6, 0.6);
  Hand.z = Hand.z * -2.3 * invert;
  return {
    UpperArm,
    LowerArm,
    Hand
  };
};
const calcHips = (lm3d, lm2d) => {
  const hipLeft2d = Vector.fromArray(lm2d[23]);
  const hipRight2d = Vector.fromArray(lm2d[24]);
  const shoulderLeft2d = Vector.fromArray(lm2d[11]);
  const shoulderRight2d = Vector.fromArray(lm2d[12]);
  const hipCenter2d = hipLeft2d.lerp(hipRight2d, 1);
  const shoulderCenter2d = shoulderLeft2d.lerp(shoulderRight2d, 1);
  const spineLength = hipCenter2d.distance(shoulderCenter2d);
  const hips = {
    position: {
      x: clamp(hipCenter2d.x - 0.4, -1, 1),
      y: 0,
      z: clamp(spineLength - 1, -2, 0)
    }
  };
  hips.worldPosition = {
    x: hips.position.x,
    y: 0,
    z: hips.position.z * Math.pow(hips.position.z * -2, 2)
  };
  hips.worldPosition.x *= hips.worldPosition.z;
  hips.rotation = Vector.rollPitchYaw(lm3d[23], lm3d[24]);
  if (hips.rotation.y > 0.5) {
    hips.rotation.y -= 2;
  }
  hips.rotation.y += 0.5;
  if (hips.rotation.z > 0) {
    hips.rotation.z = 1 - hips.rotation.z;
  }
  if (hips.rotation.z < 0) {
    hips.rotation.z = -1 - hips.rotation.z;
  }
  const turnAroundAmountHips = remap(Math.abs(hips.rotation.y), 0.2, 0.4);
  hips.rotation.z *= 1 - turnAroundAmountHips;
  hips.rotation.x = 0;
  const spine = Vector.rollPitchYaw(lm3d[11], lm3d[12]);
  if (spine.y > 0.5) {
    spine.y -= 2;
  }
  spine.y += 0.5;
  if (spine.z > 0) {
    spine.z = 1 - spine.z;
  }
  if (spine.z < 0) {
    spine.z = -1 - spine.z;
  }
  const turnAroundAmount = remap(Math.abs(spine.y), 0.2, 0.4);
  spine.z *= 1 - turnAroundAmount;
  spine.x = 0;
  return rigHips(hips, spine);
};
const rigHips = (hips, spine) => {
  if (hips.rotation) {
    hips.rotation.x *= Math.PI;
    hips.rotation.y *= Math.PI;
    hips.rotation.z *= Math.PI;
  }
  spine.x *= PI;
  spine.y *= PI;
  spine.z *= PI;
  return {
    Hips: hips,
    Spine: spine
  };
};
class Euler {
  constructor(a, b, c, rotationOrder) {
    var _a, _b, _c, _d;
    if (!!a && typeof a === "object") {
      this.x = (_a = a.x) != null ? _a : 0;
      this.y = (_b = a.y) != null ? _b : 0;
      this.z = (_c = a.z) != null ? _c : 0;
      this.rotationOrder = (_d = a.rotationOrder) != null ? _d : "XYZ";
      return;
    }
    this.x = a != null ? a : 0;
    this.y = b != null ? b : 0;
    this.z = c != null ? c : 0;
    this.rotationOrder = rotationOrder != null ? rotationOrder : "XYZ";
  }
  multiply(v) {
    return new Euler(this.x * v, this.y * v, this.z * v, this.rotationOrder);
  }
}
const offsets = {
  upperLeg: {
    z: 0.1
  }
};
const calcLegs = (lm) => {
  const rightUpperLegSphericalCoords = Vector.getSphericalCoords(lm[23], lm[25], { x: "y", y: "z", z: "x" });
  const leftUpperLegSphericalCoords = Vector.getSphericalCoords(lm[24], lm[26], { x: "y", y: "z", z: "x" });
  const rightLowerLegSphericalCoords = Vector.getRelativeSphericalCoords(lm[23], lm[25], lm[27], {
    x: "y",
    y: "z",
    z: "x"
  });
  const leftLowerLegSphericalCoords = Vector.getRelativeSphericalCoords(lm[24], lm[26], lm[28], {
    x: "y",
    y: "z",
    z: "x"
  });
  const hipRotation = Vector.findRotation(lm[23], lm[24]);
  const UpperLeg = {
    r: new Vector({
      x: rightUpperLegSphericalCoords.theta,
      y: rightLowerLegSphericalCoords.phi,
      z: rightUpperLegSphericalCoords.phi - hipRotation.z
    }),
    l: new Vector({
      x: leftUpperLegSphericalCoords.theta,
      y: leftLowerLegSphericalCoords.phi,
      z: leftUpperLegSphericalCoords.phi - hipRotation.z
    })
  };
  const LowerLeg = {
    r: new Vector({
      x: -Math.abs(rightLowerLegSphericalCoords.theta),
      y: 0,
      z: 0
    }),
    l: new Vector({
      x: -Math.abs(leftLowerLegSphericalCoords.theta),
      y: 0,
      z: 0
    })
  };
  const rightLegRig = rigLeg(UpperLeg.r, LowerLeg.r, RIGHT);
  const leftLegRig = rigLeg(UpperLeg.l, LowerLeg.l, LEFT);
  return {
    UpperLeg: {
      r: rightLegRig.UpperLeg,
      l: leftLegRig.UpperLeg
    },
    LowerLeg: {
      r: rightLegRig.LowerLeg,
      l: leftLegRig.LowerLeg
    },
    Unscaled: {
      UpperLeg,
      LowerLeg
    }
  };
};
const rigLeg = (UpperLeg, LowerLeg, side = RIGHT) => {
  const invert = side === RIGHT ? 1 : -1;
  const rigedUpperLeg = new Euler({
    x: clamp(UpperLeg.x, 0, 0.5) * PI,
    y: clamp(UpperLeg.y, -0.25, 0.25) * PI,
    z: clamp(UpperLeg.z, -0.5, 0.5) * PI + invert * offsets.upperLeg.z,
    rotationOrder: "XYZ"
  });
  const rigedLowerLeg = new Euler({
    x: LowerLeg.x * PI,
    y: LowerLeg.y * PI,
    z: LowerLeg.z * PI
  });
  return {
    UpperLeg: rigedUpperLeg,
    LowerLeg: rigedLowerLeg
  };
};
class PoseSolver {
  static solve(lm3d, lm2d, { runtime = "mediapipe", video = null, imageSize = null, enableLegs = true } = {}) {
    var _a, _b, _c, _d;
    if (!lm3d && !lm2d) {
      console.error("Need both World Pose and Pose Landmarks");
      return;
    }
    if (video) {
      const videoEl = typeof video === "string" ? document.querySelector(video) : video;
      imageSize = {
        width: videoEl.videoWidth,
        height: videoEl.videoHeight
      };
    }
    if (runtime === "tfjs" && imageSize) {
      for (const e of lm3d) {
        e.visibility = e.score;
      }
      for (const e of lm2d) {
        e.x /= imageSize.width;
        e.y /= imageSize.height;
        e.z = 0;
        e.visibility = e.score;
      }
    }
    const Arms = calcArms(lm3d);
    const Hips = calcHips(lm3d, lm2d);
    const Legs = enableLegs ? calcLegs(lm3d) : null;
    const rightHandOffscreen = lm3d[15].y > 0.1 || ((_a = lm3d[15].visibility) != null ? _a : 0) < 0.23 || 0.995 < lm2d[15].y;
    const leftHandOffscreen = lm3d[16].y > 0.1 || ((_b = lm3d[16].visibility) != null ? _b : 0) < 0.23 || 0.995 < lm2d[16].y;
    const leftFootOffscreen = lm3d[23].y > 0.1 || ((_c = lm3d[23].visibility) != null ? _c : 0) < 0.63 || Hips.Hips.position.z > -0.4;
    const rightFootOffscreen = lm3d[24].y > 0.1 || ((_d = lm3d[24].visibility) != null ? _d : 0) < 0.63 || Hips.Hips.position.z > -0.4;
    Arms.UpperArm.l = Arms.UpperArm.l.multiply(leftHandOffscreen ? 0 : 1);
    Arms.UpperArm.l.z = leftHandOffscreen ? RestingDefault.Pose.LeftUpperArm.z : Arms.UpperArm.l.z;
    Arms.UpperArm.r = Arms.UpperArm.r.multiply(rightHandOffscreen ? 0 : 1);
    Arms.UpperArm.r.z = rightHandOffscreen ? RestingDefault.Pose.RightUpperArm.z : Arms.UpperArm.r.z;
    Arms.LowerArm.l = Arms.LowerArm.l.multiply(leftHandOffscreen ? 0 : 1);
    Arms.LowerArm.r = Arms.LowerArm.r.multiply(rightHandOffscreen ? 0 : 1);
    Arms.Hand.l = Arms.Hand.l.multiply(leftHandOffscreen ? 0 : 1);
    Arms.Hand.r = Arms.Hand.r.multiply(rightHandOffscreen ? 0 : 1);
    if (Legs) {
      Legs.UpperLeg.l = Legs.UpperLeg.l.multiply(rightFootOffscreen ? 0 : 1);
      Legs.UpperLeg.r = Legs.UpperLeg.r.multiply(leftFootOffscreen ? 0 : 1);
      Legs.LowerLeg.l = Legs.LowerLeg.l.multiply(rightFootOffscreen ? 0 : 1);
      Legs.LowerLeg.r = Legs.LowerLeg.r.multiply(leftFootOffscreen ? 0 : 1);
    }
    return {
      RightUpperArm: Arms.UpperArm.r,
      RightLowerArm: Arms.LowerArm.r,
      LeftUpperArm: Arms.UpperArm.l,
      LeftLowerArm: Arms.LowerArm.l,
      RightHand: Arms.Hand.r,
      LeftHand: Arms.Hand.l,
      RightUpperLeg: Legs ? Legs.UpperLeg.r : RestingDefault.Pose.RightUpperLeg,
      RightLowerLeg: Legs ? Legs.LowerLeg.r : RestingDefault.Pose.RightLowerLeg,
      LeftUpperLeg: Legs ? Legs.UpperLeg.l : RestingDefault.Pose.LeftUpperLeg,
      LeftLowerLeg: Legs ? Legs.LowerLeg.l : RestingDefault.Pose.LeftLowerLeg,
      Hips: Hips.Hips,
      Spine: Hips.Spine
    };
  }
}
PoseSolver.calcArms = calcArms;
PoseSolver.calcHips = calcHips;
PoseSolver.calcLegs = calcLegs;
class HandSolver {
  static solve(lm, side = RIGHT) {
    if (!lm) {
      console.error("Need Hand Landmarks");
      return;
    }
    const palm = [
      new Vector(lm[0]),
      new Vector(lm[side === RIGHT ? 17 : 5]),
      new Vector(lm[side === RIGHT ? 5 : 17])
    ];
    const handRotation = Vector.rollPitchYaw(palm[0], palm[1], palm[2]);
    handRotation.y = handRotation.z;
    handRotation.y -= side === LEFT ? 0.4 : 0.4;
    let hand = {};
    hand[side + "Wrist"] = { x: handRotation.x, y: handRotation.y, z: handRotation.z };
    hand[side + "RingProximal"] = { x: 0, y: 0, z: Vector.angleBetween3DCoords(lm[0], lm[13], lm[14]) };
    hand[side + "RingIntermediate"] = { x: 0, y: 0, z: Vector.angleBetween3DCoords(lm[13], lm[14], lm[15]) };
    hand[side + "RingDistal"] = { x: 0, y: 0, z: Vector.angleBetween3DCoords(lm[14], lm[15], lm[16]) };
    hand[side + "IndexProximal"] = { x: 0, y: 0, z: Vector.angleBetween3DCoords(lm[0], lm[5], lm[6]) };
    hand[side + "IndexIntermediate"] = { x: 0, y: 0, z: Vector.angleBetween3DCoords(lm[5], lm[6], lm[7]) };
    hand[side + "IndexDistal"] = { x: 0, y: 0, z: Vector.angleBetween3DCoords(lm[6], lm[7], lm[8]) };
    hand[side + "MiddleProximal"] = { x: 0, y: 0, z: Vector.angleBetween3DCoords(lm[0], lm[9], lm[10]) };
    hand[side + "MiddleIntermediate"] = { x: 0, y: 0, z: Vector.angleBetween3DCoords(lm[9], lm[10], lm[11]) };
    hand[side + "MiddleDistal"] = { x: 0, y: 0, z: Vector.angleBetween3DCoords(lm[10], lm[11], lm[12]) };
    hand[side + "ThumbProximal"] = { x: 0, y: 0, z: Vector.angleBetween3DCoords(lm[0], lm[1], lm[2]) };
    hand[side + "ThumbIntermediate"] = { x: 0, y: 0, z: Vector.angleBetween3DCoords(lm[1], lm[2], lm[3]) };
    hand[side + "ThumbDistal"] = { x: 0, y: 0, z: Vector.angleBetween3DCoords(lm[2], lm[3], lm[4]) };
    hand[side + "LittleProximal"] = { x: 0, y: 0, z: Vector.angleBetween3DCoords(lm[0], lm[17], lm[18]) };
    hand[side + "LittleIntermediate"] = { x: 0, y: 0, z: Vector.angleBetween3DCoords(lm[17], lm[18], lm[19]) };
    hand[side + "LittleDistal"] = { x: 0, y: 0, z: Vector.angleBetween3DCoords(lm[18], lm[19], lm[20]) };
    hand = rigFingers(hand, side);
    return hand;
  }
}
const rigFingers = (hand, side = RIGHT) => {
  const invert = side === RIGHT ? 1 : -1;
  const digits = ["Ring", "Index", "Little", "Thumb", "Middle"];
  const segments = ["Proximal", "Intermediate", "Distal"];
  hand[side + "Wrist"].x = clamp(hand[side + "Wrist"].x * 2 * invert, -0.3, 0.3);
  hand[side + "Wrist"].y = clamp(hand[side + "Wrist"].y * 2.3, side === RIGHT ? -1.2 : -0.6, side === RIGHT ? 0.6 : 1.6);
  hand[side + "Wrist"].z = hand[side + "Wrist"].z * -2.3 * invert;
  digits.forEach((e) => {
    segments.forEach((j) => {
      const trackedFinger = hand[side + e + j];
      if (e === "Thumb") {
        const dampener = {
          x: j === "Proximal" ? 2.2 : j === "Intermediate" ? 0 : 0,
          y: j === "Proximal" ? 2.2 : j === "Intermediate" ? 0.7 : 1,
          z: j === "Proximal" ? 0.5 : j === "Intermediate" ? 0.5 : 0.5
        };
        const startPos = {
          x: j === "Proximal" ? 1.2 : j === "Distal" ? -0.2 : -0.2,
          y: j === "Proximal" ? 1.1 * invert : j === "Distal" ? 0.1 * invert : 0.1 * invert,
          z: j === "Proximal" ? 0.2 * invert : j === "Distal" ? 0.2 * invert : 0.2 * invert
        };
        const newThumb = { x: 0, y: 0, z: 0 };
        if (j === "Proximal") {
          newThumb.z = clamp(startPos.z + trackedFinger.z * -PI * dampener.z * invert, side === RIGHT ? -0.6 : -0.3, side === RIGHT ? 0.3 : 0.6);
          newThumb.x = clamp(startPos.x + trackedFinger.z * -PI * dampener.x, -0.6, 0.3);
          newThumb.y = clamp(startPos.y + trackedFinger.z * -PI * dampener.y * invert, side === RIGHT ? -1 : -0.3, side === RIGHT ? 0.3 : 1);
        } else {
          newThumb.z = clamp(startPos.z + trackedFinger.z * -PI * dampener.z * invert, -2, 2);
          newThumb.x = clamp(startPos.x + trackedFinger.z * -PI * dampener.x, -2, 2);
          newThumb.y = clamp(startPos.y + trackedFinger.z * -PI * dampener.y * invert, -2, 2);
        }
        trackedFinger.x = newThumb.x;
        trackedFinger.y = newThumb.y;
        trackedFinger.z = newThumb.z;
      } else {
        trackedFinger.z = clamp(trackedFinger.z * -PI * invert, side === RIGHT ? -PI : 0, side === RIGHT ? 0 : PI);
      }
    });
  });
  return hand;
};
const createEulerPlane = (lm) => {
  const p1 = new Vector(lm[21]);
  const p2 = new Vector(lm[251]);
  const p3 = new Vector(lm[397]);
  const p4 = new Vector(lm[172]);
  const p3mid = p3.lerp(p4, 0.5);
  return {
    vector: [p1, p2, p3mid],
    points: [p1, p2, p3, p4]
  };
};
const calcHead = (lm) => {
  const plane = createEulerPlane(lm).vector;
  const rotate = Vector.rollPitchYaw(plane[0], plane[1], plane[2]);
  const midPoint = plane[0].lerp(plane[1], 0.5);
  const width = plane[0].distance(plane[1]);
  const height = midPoint.distance(plane[2]);
  rotate.x *= -1;
  rotate.z *= -1;
  return {
    y: rotate.y * PI,
    x: rotate.x * PI,
    z: rotate.z * PI,
    width,
    height,
    position: midPoint.lerp(plane[2], 0.5),
    normalized: {
      y: rotate.y,
      x: rotate.x,
      z: rotate.z
    },
    degrees: {
      y: rotate.y * 180,
      x: rotate.x * 180,
      z: rotate.z * 180
    }
  };
};
const points = {
  eye: {
    [LEFT]: [130, 133, 160, 159, 158, 144, 145, 153],
    [RIGHT]: [263, 362, 387, 386, 385, 373, 374, 380]
  },
  brow: {
    [LEFT]: [35, 244, 63, 105, 66, 229, 230, 231],
    [RIGHT]: [265, 464, 293, 334, 296, 449, 450, 451]
  },
  pupil: {
    [LEFT]: [468, 469, 470, 471, 472],
    [RIGHT]: [473, 474, 475, 476, 477]
  }
};
const getEyeOpen = (lm, side = LEFT, { high = 0.85, low = 0.55 } = {}) => {
  const eyePoints = points.eye[side];
  const eyeDistance = eyeLidRatio(lm[eyePoints[0]], lm[eyePoints[1]], lm[eyePoints[2]], lm[eyePoints[3]], lm[eyePoints[4]], lm[eyePoints[5]], lm[eyePoints[6]], lm[eyePoints[7]]);
  const maxRatio = 0.285;
  const ratio = clamp(eyeDistance / maxRatio, 0, 2);
  const eyeOpenRatio = remap(ratio, low, high);
  return {
    norm: eyeOpenRatio,
    raw: ratio
  };
};
const eyeLidRatio = (eyeOuterCorner, eyeInnerCorner, eyeOuterUpperLid, eyeMidUpperLid, eyeInnerUpperLid, eyeOuterLowerLid, eyeMidLowerLid, eyeInnerLowerLid) => {
  eyeOuterCorner = new Vector(eyeOuterCorner);
  eyeInnerCorner = new Vector(eyeInnerCorner);
  eyeOuterUpperLid = new Vector(eyeOuterUpperLid);
  eyeMidUpperLid = new Vector(eyeMidUpperLid);
  eyeInnerUpperLid = new Vector(eyeInnerUpperLid);
  eyeOuterLowerLid = new Vector(eyeOuterLowerLid);
  eyeMidLowerLid = new Vector(eyeMidLowerLid);
  eyeInnerLowerLid = new Vector(eyeInnerLowerLid);
  const eyeWidth = eyeOuterCorner.distance(eyeInnerCorner, 2);
  const eyeOuterLidDistance = eyeOuterUpperLid.distance(eyeOuterLowerLid, 2);
  const eyeMidLidDistance = eyeMidUpperLid.distance(eyeMidLowerLid, 2);
  const eyeInnerLidDistance = eyeInnerUpperLid.distance(eyeInnerLowerLid, 2);
  const eyeLidAvg = (eyeOuterLidDistance + eyeMidLidDistance + eyeInnerLidDistance) / 3;
  const ratio = eyeLidAvg / eyeWidth;
  return ratio;
};
const pupilPos = (lm, side = LEFT) => {
  const eyeOuterCorner = new Vector(lm[points.eye[side][0]]);
  const eyeInnerCorner = new Vector(lm[points.eye[side][1]]);
  const eyeWidth = eyeOuterCorner.distance(eyeInnerCorner, 2);
  const midPoint = eyeOuterCorner.lerp(eyeInnerCorner, 0.5);
  const pupil = new Vector(lm[points.pupil[side][0]]);
  const dx = midPoint.x - pupil.x;
  const dy = midPoint.y - eyeWidth * 0.075 - pupil.y;
  let ratioX = dx / (eyeWidth / 2);
  let ratioY = dy / (eyeWidth / 4);
  ratioX *= 4;
  ratioY *= 4;
  return { x: ratioX, y: ratioY };
};
const stabilizeBlink = (eye, headY, {
  enableWink = true,
  maxRot = 0.5
} = {}) => {
  eye.r = clamp(eye.r, 0, 1);
  eye.l = clamp(eye.l, 0, 1);
  const blinkDiff = Math.abs(eye.l - eye.r);
  const blinkThresh = enableWink ? 0.8 : 1.2;
  const isClosing = eye.l < 0.3 && eye.r < 0.3;
  const isOpen = eye.l > 0.6 && eye.r > 0.6;
  if (headY > maxRot) {
    return { l: eye.r, r: eye.r };
  }
  if (headY < -maxRot) {
    return { l: eye.l, r: eye.l };
  }
  return {
    l: blinkDiff >= blinkThresh && !isClosing && !isOpen ? eye.l : eye.r > eye.l ? Vector.lerp(eye.r, eye.l, 0.95) : Vector.lerp(eye.r, eye.l, 0.05),
    r: blinkDiff >= blinkThresh && !isClosing && !isOpen ? eye.r : eye.r > eye.l ? Vector.lerp(eye.r, eye.l, 0.95) : Vector.lerp(eye.r, eye.l, 0.05)
  };
};
const calcEyes = (lm, {
  high = 0.85,
  low = 0.55
} = {}) => {
  if (lm.length !== 478) {
    return {
      l: 1,
      r: 1
    };
  }
  const leftEyeLid = getEyeOpen(lm, LEFT, { high, low });
  const rightEyeLid = getEyeOpen(lm, RIGHT, { high, low });
  return {
    l: leftEyeLid.norm || 0,
    r: rightEyeLid.norm || 0
  };
};
const calcPupils = (lm) => {
  if (lm.length !== 478) {
    return { x: 0, y: 0 };
  } else {
    const pupilL = pupilPos(lm, LEFT);
    const pupilR = pupilPos(lm, RIGHT);
    return {
      x: (pupilL.x + pupilR.x) * 0.5 || 0,
      y: (pupilL.y + pupilR.y) * 0.5 || 0
    };
  }
};
const getBrowRaise = (lm, side = LEFT) => {
  const browPoints = points.brow[side];
  const browDistance = eyeLidRatio(lm[browPoints[0]], lm[browPoints[1]], lm[browPoints[2]], lm[browPoints[3]], lm[browPoints[4]], lm[browPoints[5]], lm[browPoints[6]], lm[browPoints[7]]);
  const maxBrowRatio = 1.15;
  const browHigh = 0.125;
  const browLow = 0.07;
  const browRatio = browDistance / maxBrowRatio - 1;
  const browRaiseRatio = (clamp(browRatio, browLow, browHigh) - browLow) / (browHigh - browLow);
  return browRaiseRatio;
};
const calcBrow = (lm) => {
  if (lm.length !== 478) {
    return 0;
  } else {
    const leftBrow = getBrowRaise(lm, LEFT);
    const rightBrow = getBrowRaise(lm, RIGHT);
    return (leftBrow + rightBrow) / 2 || 0;
  }
};
const calcMouth = (lm) => {
  const eyeInnerCornerL = new Vector(lm[133]);
  const eyeInnerCornerR = new Vector(lm[362]);
  const eyeOuterCornerL = new Vector(lm[130]);
  const eyeOuterCornerR = new Vector(lm[263]);
  const eyeInnerDistance = eyeInnerCornerL.distance(eyeInnerCornerR);
  const eyeOuterDistance = eyeOuterCornerL.distance(eyeOuterCornerR);
  const upperInnerLip = new Vector(lm[13]);
  const lowerInnerLip = new Vector(lm[14]);
  const mouthCornerLeft = new Vector(lm[61]);
  const mouthCornerRight = new Vector(lm[291]);
  const mouthOpen = upperInnerLip.distance(lowerInnerLip);
  const mouthWidth = mouthCornerLeft.distance(mouthCornerRight);
  let ratioY = mouthOpen / eyeInnerDistance;
  let ratioX = mouthWidth / eyeOuterDistance;
  ratioY = remap(ratioY, 0.15, 0.7);
  ratioX = remap(ratioX, 0.45, 0.9);
  ratioX = (ratioX - 0.3) * 2;
  const mouthX = ratioX;
  const mouthY = remap(mouthOpen / eyeInnerDistance, 0.17, 0.5);
  const ratioI = clamp(remap(mouthX, 0, 1) * 2 * remap(mouthY, 0.2, 0.7), 0, 1);
  const ratioA = mouthY * 0.4 + mouthY * (1 - ratioI) * 0.6;
  const ratioU = mouthY * remap(1 - ratioI, 0, 0.3) * 0.1;
  const ratioE = remap(ratioU, 0.2, 1) * (1 - ratioI) * 0.3;
  const ratioO = (1 - ratioI) * remap(mouthY, 0.3, 1) * 0.4;
  return {
    x: ratioX || 0,
    y: ratioY || 0,
    shape: {
      A: ratioA || 0,
      E: ratioE || 0,
      I: ratioI || 0,
      O: ratioO || 0,
      U: ratioU || 0
    }
  };
};
class FaceSolver {
  static solve(lm, {
    runtime = "tfjs",
    video = null,
    imageSize = null,
    smoothBlink = false,
    blinkSettings = []
  } = {}) {
    if (!lm) {
      console.error("Need Face Landmarks");
      return;
    }
    if (video) {
      const videoEl = typeof video === "string" ? document.querySelector(video) : video;
      imageSize = {
        width: videoEl.videoWidth,
        height: videoEl.videoHeight
      };
    }
    if (runtime === "mediapipe" && imageSize) {
      for (const e of lm) {
        e.x *= imageSize.width;
        e.y *= imageSize.height;
        e.z *= imageSize.width;
      }
    }
    const getHead = calcHead(lm);
    const getMouth = calcMouth(lm);
    blinkSettings = blinkSettings.length > 0 ? blinkSettings : runtime === "tfjs" ? [0.55, 0.85] : [0.35, 0.5];
    let getEye = calcEyes(lm, {
      high: blinkSettings[1],
      low: blinkSettings[0]
    });
    if (smoothBlink) {
      getEye = stabilizeBlink(getEye, getHead.y);
    }
    const getPupils = calcPupils(lm);
    const getBrow = calcBrow(lm);
    return {
      head: getHead,
      eye: getEye,
      brow: getBrow,
      pupil: getPupils,
      mouth: getMouth
    };
  }
}
FaceSolver.stabilizeBlink = stabilizeBlink;
const __fakeValueExport__ = null;
export { __fakeValueExport__ as AxisMap, __fakeValueExport__ as EulerRotation, FaceSolver as Face, HandSolver as Hand, __fakeValueExport__ as HandKeys, __fakeValueExport__ as IFaceSolveOptions, __fakeValueExport__ as IHips, __fakeValueExport__ as IPoseSolveOptions, __fakeValueExport__ as ISolveOptions, __fakeValueExport__ as LR, PoseSolver as Pose, __fakeValueExport__ as Results, __fakeValueExport__ as RotationOrder, __fakeValueExport__ as Side, __fakeValueExport__ as TFVectorPose, __fakeValueExport__ as TFace, __fakeValueExport__ as THand, __fakeValueExport__ as THandUnsafe, __fakeValueExport__ as TPose, helpers as Utils, Vector, __fakeValueExport__ as XYZ };
