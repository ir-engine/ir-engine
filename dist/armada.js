import { Component, Types, TagComponent, System } from 'ecsy';
import { Transform } from 'ecsy-three/src/extras/components';
import { Quaternion, Euler } from 'three';

// Constructs a component with a map and data values
// Data contains a map() of arbitrary data
class BehaviorComponent extends Component {
    constructor() {
        super(false);
        this.data = new Map();
        this.data = new Map();
    }
    copy(src) {
        this.map = src.map;
        this.data = new Map(src.data);
        return this;
    }
    reset() {
        this.data.clear();
    }
}

// Default component, holds data about what behaviors our character has.
const defaultJumpValues = {
    canJump: true,
    t: 0,
    height: 1.0,
    duration: 1
};
class Actor extends Component {
    constructor() {
        super();
        this.jump = defaultJumpValues;
        this.reset();
    }
    copy(src) {
        this.rotationSpeedX = src.rotationSpeedX;
        this.rotationSpeedY = src.rotationSpeedY;
        this.maxSpeed = src.maxSpeed;
        this.accelerationSpeed = src.accelerationSpeed;
        this.jump = src.jump;
        return this;
    }
    reset() {
        this.rotationSpeedX = 1;
        this.rotationSpeedY = 1;
        this.maxSpeed = 10;
        this.accelerationSpeed = 1;
        this.jump = defaultJumpValues;
    }
}

const vector3Identity = [0, 0, 0];
const vector3ScaleIdentity = [1, 1, 1];
const quaternionIdentity = [0, 0, 0, 1];
class TransformComponent extends Component {
    constructor() {
        super();
        this.position = [...vector3Identity];
        this.rotation = [...quaternionIdentity];
        this.scale = [...vector3ScaleIdentity];
        this.velocity = [...vector3Identity];
        this.position = [...vector3Identity];
        this.rotation = [...quaternionIdentity];
        this.scale = [...vector3ScaleIdentity];
        this.velocity = [...vector3Identity];
    }
    copy(src) {
        this.position = src.position;
        this.rotation = src.rotation;
        this.scale = src.scale;
        this.velocity = src.velocity;
        return this;
    }
    reset() {
        this.position = [...vector3Identity];
        this.rotation = [...quaternionIdentity];
        this.scale = [...vector3ScaleIdentity];
        this.velocity = [...vector3Identity];
    }
}

/**
 * Common utilities
 * @module glMatrix
 */
// Configuration Constants
var EPSILON = 0.000001;
var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
if (!Math.hypot) Math.hypot = function () {
  var y = 0,
      i = arguments.length;

  while (i--) {
    y += arguments[i] * arguments[i];
  }

  return Math.sqrt(y);
};

/**
 * 3x3 Matrix
 * @module mat3
 */

/**
 * Creates a new identity mat3
 *
 * @returns {mat3} a new 3x3 matrix
 */

function create() {
  var out = new ARRAY_TYPE(9);

  if (ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
  }

  out[0] = 1;
  out[4] = 1;
  out[8] = 1;
  return out;
}

/**
 * 3 Dimensional Vector
 * @module vec3
 */

/**
 * Creates a new, empty vec3
 *
 * @returns {vec3} a new 3D vector
 */

function create$1() {
  var out = new ARRAY_TYPE(3);

  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }

  return out;
}
/**
 * Calculates the length of a vec3
 *
 * @param {ReadonlyVec3} a vector to calculate length of
 * @returns {Number} length of a
 */

function length(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return Math.hypot(x, y, z);
}
/**
 * Creates a new vec3 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} a new 3D vector
 */

function fromValues(x, y, z) {
  var out = new ARRAY_TYPE(3);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}
/**
 * Adds two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */

function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  return out;
}
/**
 * Scales a vec3 by a scalar number
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec3} out
 */

function scale(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  return out;
}
/**
 * Normalize a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a vector to normalize
 * @returns {vec3} out
 */

function normalize(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var len = x * x + y * y + z * z;

  if (len > 0) {
    //TODO: evaluate use of glm_invsqrt here?
    len = 1 / Math.sqrt(len);
  }

  out[0] = a[0] * len;
  out[1] = a[1] * len;
  out[2] = a[2] * len;
  return out;
}
/**
 * Calculates the dot product of two vec3's
 *
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {Number} dot product of a and b
 */

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */

function cross(out, a, b) {
  var ax = a[0],
      ay = a[1],
      az = a[2];
  var bx = b[0],
      by = b[1],
      bz = b[2];
  out[0] = ay * bz - az * by;
  out[1] = az * bx - ax * bz;
  out[2] = ax * by - ay * bx;
  return out;
}
/**
 * Alias for {@link vec3.length}
 * @function
 */

var len = length;
/**
 * Perform some operation over an array of vec3s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */

var forEach = function () {
  var vec = create$1();
  return function (a, stride, offset, count, fn, arg) {
    var i, l;

    if (!stride) {
      stride = 3;
    }

    if (!offset) {
      offset = 0;
    }

    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }

    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
    }

    return a;
  };
}();

/**
 * 4 Dimensional Vector
 * @module vec4
 */

/**
 * Creates a new, empty vec4
 *
 * @returns {vec4} a new 4D vector
 */

function create$2() {
  var out = new ARRAY_TYPE(4);

  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
  }

  return out;
}
/**
 * Set the components of a vec4 to the given values
 *
 * @param {vec4} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} out
 */

function set(out, x, y, z, w) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out;
}
/**
 * Normalize a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to normalize
 * @returns {vec4} out
 */

function normalize$1(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  var len = x * x + y * y + z * z + w * w;

  if (len > 0) {
    len = 1 / Math.sqrt(len);
  }

  out[0] = x * len;
  out[1] = y * len;
  out[2] = z * len;
  out[3] = w * len;
  return out;
}
/**
 * Perform some operation over an array of vec4s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec4s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */

var forEach$1 = function () {
  var vec = create$2();
  return function (a, stride, offset, count, fn, arg) {
    var i, l;

    if (!stride) {
      stride = 4;
    }

    if (!offset) {
      offset = 0;
    }

    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }

    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      vec[3] = a[i + 3];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
      a[i + 3] = vec[3];
    }

    return a;
  };
}();

/**
 * Quaternion
 * @module quat
 */

/**
 * Creates a new identity quat
 *
 * @returns {quat} a new quaternion
 */

function create$3() {
  var out = new ARRAY_TYPE(4);

  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }

  out[3] = 1;
  return out;
}
/**
 * Sets a quat from the given angle and rotation axis,
 * then returns it.
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyVec3} axis the axis around which to rotate
 * @param {Number} rad the angle in radians
 * @returns {quat} out
 **/

function setAxisAngle(out, axis, rad) {
  rad = rad * 0.5;
  var s = Math.sin(rad);
  out[0] = s * axis[0];
  out[1] = s * axis[1];
  out[2] = s * axis[2];
  out[3] = Math.cos(rad);
  return out;
}
/**
 * Rotates a quaternion by the given angle about the X axis
 *
 * @param {quat} out quat receiving operation result
 * @param {ReadonlyQuat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */

function rotateX(out, a, rad) {
  rad *= 0.5;
  var ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  var bx = Math.sin(rad),
      bw = Math.cos(rad);
  out[0] = ax * bw + aw * bx;
  out[1] = ay * bw + az * bx;
  out[2] = az * bw - ay * bx;
  out[3] = aw * bw - ax * bx;
  return out;
}
/**
 * Rotates a quaternion by the given angle about the Y axis
 *
 * @param {quat} out quat receiving operation result
 * @param {ReadonlyQuat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */

function rotateY(out, a, rad) {
  rad *= 0.5;
  var ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  var by = Math.sin(rad),
      bw = Math.cos(rad);
  out[0] = ax * bw - az * by;
  out[1] = ay * bw + aw * by;
  out[2] = az * bw + ax * by;
  out[3] = aw * bw - ay * by;
  return out;
}
/**
 * Performs a spherical linear interpolation between two quat
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {quat} out
 */

function slerp(out, a, b, t) {
  // benchmarks:
  //    http://jsperf.com/quaternion-slerp-implementations
  var ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  var bx = b[0],
      by = b[1],
      bz = b[2],
      bw = b[3];
  var omega, cosom, sinom, scale0, scale1; // calc cosine

  cosom = ax * bx + ay * by + az * bz + aw * bw; // adjust signs (if necessary)

  if (cosom < 0.0) {
    cosom = -cosom;
    bx = -bx;
    by = -by;
    bz = -bz;
    bw = -bw;
  } // calculate coefficients


  if (1.0 - cosom > EPSILON) {
    // standard case (slerp)
    omega = Math.acos(cosom);
    sinom = Math.sin(omega);
    scale0 = Math.sin((1.0 - t) * omega) / sinom;
    scale1 = Math.sin(t * omega) / sinom;
  } else {
    // "from" and "to" quaternions are very close
    //  ... so we can do a linear interpolation
    scale0 = 1.0 - t;
    scale1 = t;
  } // calculate final values


  out[0] = scale0 * ax + scale1 * bx;
  out[1] = scale0 * ay + scale1 * by;
  out[2] = scale0 * az + scale1 * bz;
  out[3] = scale0 * aw + scale1 * bw;
  return out;
}
/**
 * Creates a quaternion from the given 3x3 rotation matrix.
 *
 * NOTE: The resultant quaternion is not normalized, so you should be sure
 * to renormalize the quaternion yourself where necessary.
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyMat3} m rotation matrix
 * @returns {quat} out
 * @function
 */

function fromMat3(out, m) {
  // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
  // article "Quaternion Calculus and Fast Animation".
  var fTrace = m[0] + m[4] + m[8];
  var fRoot;

  if (fTrace > 0.0) {
    // |w| > 1/2, may as well choose w > 1/2
    fRoot = Math.sqrt(fTrace + 1.0); // 2w

    out[3] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot; // 1/(4w)

    out[0] = (m[5] - m[7]) * fRoot;
    out[1] = (m[6] - m[2]) * fRoot;
    out[2] = (m[1] - m[3]) * fRoot;
  } else {
    // |w| <= 1/2
    var i = 0;
    if (m[4] > m[0]) i = 1;
    if (m[8] > m[i * 3 + i]) i = 2;
    var j = (i + 1) % 3;
    var k = (i + 2) % 3;
    fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
    out[i] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
    out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
    out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
  }

  return out;
}
/**
 * Creates a quaternion from the given euler angle x, y, z.
 *
 * @param {quat} out the receiving quaternion
 * @param {x} Angle to rotate around X axis in degrees.
 * @param {y} Angle to rotate around Y axis in degrees.
 * @param {z} Angle to rotate around Z axis in degrees.
 * @returns {quat} out
 * @function
 */

function fromEuler(out, x, y, z) {
  var halfToRad = 0.5 * Math.PI / 180.0;
  x *= halfToRad;
  y *= halfToRad;
  z *= halfToRad;
  var sx = Math.sin(x);
  var cx = Math.cos(x);
  var sy = Math.sin(y);
  var cy = Math.cos(y);
  var sz = Math.sin(z);
  var cz = Math.cos(z);
  out[0] = sx * cy * cz - cx * sy * sz;
  out[1] = cx * sy * cz + sx * cy * sz;
  out[2] = cx * cy * sz - sx * sy * cz;
  out[3] = cx * cy * cz + sx * sy * sz;
  return out;
}
/**
 * Set the components of a quat to the given values
 *
 * @param {quat} out the receiving quaternion
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} out
 * @function
 */

var set$1 = set;
/**
 * Normalize a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a quaternion to normalize
 * @returns {quat} out
 * @function
 */

var normalize$2 = normalize$1;
/**
 * Sets a quaternion to represent the shortest rotation from one
 * vector to another.
 *
 * Both vectors are assumed to be unit length.
 *
 * @param {quat} out the receiving quaternion.
 * @param {ReadonlyVec3} a the initial vector
 * @param {ReadonlyVec3} b the destination vector
 * @returns {quat} out
 */

var rotationTo = function () {
  var tmpvec3 = create$1();
  var xUnitVec3 = fromValues(1, 0, 0);
  var yUnitVec3 = fromValues(0, 1, 0);
  return function (out, a, b) {
    var dot$1 = dot(a, b);

    if (dot$1 < -0.999999) {
      cross(tmpvec3, xUnitVec3, a);
      if (len(tmpvec3) < 0.000001) cross(tmpvec3, yUnitVec3, a);
      normalize(tmpvec3, tmpvec3);
      setAxisAngle(out, tmpvec3, Math.PI);
      return out;
    } else if (dot$1 > 0.999999) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      out[3] = 1;
      return out;
    } else {
      cross(tmpvec3, a, b);
      out[0] = tmpvec3[0];
      out[1] = tmpvec3[1];
      out[2] = tmpvec3[2];
      out[3] = 1 + dot$1;
      return normalize$2(out, out);
    }
  };
}();
/**
 * Performs a spherical linear interpolation with two control points
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @param {ReadonlyQuat} c the third operand
 * @param {ReadonlyQuat} d the fourth operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {quat} out
 */

var sqlerp = function () {
  var temp1 = create$3();
  var temp2 = create$3();
  return function (out, a, b, c, d, t) {
    slerp(temp1, a, d, t);
    slerp(temp2, b, c, t);
    slerp(out, temp1, temp2, 2 * t * (1 - t));
    return out;
  };
}();
/**
 * Sets the specified quaternion with values corresponding to the given
 * axes. Each axis is a vec3 and is expected to be unit length and
 * perpendicular to all other specified axes.
 *
 * @param {ReadonlyVec3} view  the vector representing the viewing direction
 * @param {ReadonlyVec3} right the vector representing the local "right" direction
 * @param {ReadonlyVec3} up    the vector representing the local "up" direction
 * @returns {quat} out
 */

var setAxes = function () {
  var matr = create();
  return function (out, view, right, up) {
    matr[0] = right[0];
    matr[3] = right[1];
    matr[6] = right[2];
    matr[1] = up[0];
    matr[4] = up[1];
    matr[7] = up[2];
    matr[2] = -view[0];
    matr[5] = -view[1];
    matr[8] = -view[2];
    return normalize$2(out, fromMat3(out, matr));
  };
}();

let actor;
let transform;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const decelerate = (entity, args, delta) => {
    actor = entity.getComponent(Actor);
    transform = entity.getMutableComponent(TransformComponent);
    if (length(transform.velocity) > 0.001) {
        transform.velocity[0] = transform.velocity[0] * Math.max(1.0 - actor.accelerationSpeed * delta, 0);
        transform.velocity[1] = transform.velocity[1] * Math.max(1.0 - actor.accelerationSpeed * delta, 0);
        transform.velocity[2] = transform.velocity[2] * Math.max(1.0 - actor.accelerationSpeed * delta, 0);
    }
};

class State extends BehaviorComponent {
}

const BinaryValue = {
    ON: 1,
    OFF: 0
};

var StateType;
(function (StateType) {
    StateType[StateType["DISCRETE"] = 0] = "DISCRETE";
    StateType[StateType["ONED"] = 1] = "ONED";
    StateType[StateType["TWOD"] = 2] = "TWOD";
    StateType[StateType["THREED"] = 3] = "THREED";
})(StateType || (StateType = {}));

var LifecycleValue;
(function (LifecycleValue) {
    LifecycleValue[LifecycleValue["STARTED"] = 0] = "STARTED";
    LifecycleValue[LifecycleValue["CONTINUED"] = 1] = "CONTINUED";
    LifecycleValue[LifecycleValue["ENDED"] = 2] = "ENDED";
})(LifecycleValue || (LifecycleValue = {}));
var LifecycleValue$1 = LifecycleValue;

let stateComponent;
let stateGroup;
const toggleState = (entity, args) => {
    if (args.value === BinaryValue.ON)
        addState(entity, args);
    else
        removeState(entity, args);
};
const addState = (entity, args) => {
    stateComponent = entity.getComponent(State);
    if (stateComponent.data.has(args.state))
        return;
    console.log("Adding state: " + args.state);
    stateComponent.data.set(args.state, {
        state: args.state,
        type: StateType.DISCRETE,
        lifecycleState: LifecycleValue$1.STARTED,
        group: stateComponent.map.states[args.state].group
    });
    stateGroup = stateComponent.map.states[args.state].group;
    // If state group is set to exclusive (XOR) then check if other states from state group are on
    if (stateComponent.map.groups[stateGroup].exclusive) {
        stateComponent.map.groups[stateGroup].states.forEach(state => {
            if (state === args.state || !stateComponent.data.has(state))
                return;
            stateComponent.data.delete(state);
            console.log("Removed mutex state " + state);
        });
    }
};
const removeState = (entity, args) => {
    // check state group
    stateComponent = entity.getComponent(State);
    if (stateComponent.data.has(args.state)) {
        stateComponent.data.delete(args.state);
        console.log("Removed component from " + entity.id);
    }
};
const hasState = (entity, args) => {
    // check state group
    stateComponent = entity.getComponent(State);
    if (stateComponent.data.has(args.state))
        return true;
    return false;
};

const DefaultStateTypes = {
    // Main States
    IDLE: 0,
    MOVING: 1,
    JUMPING: 2,
    FALLING: 3,
    // Modifier States
    CROUCHING: 4,
    WALKING: 5,
    SPRINTING: 6,
    INTERACTING: 7,
    // Moving substates
    MOVING_FORWARD: 8,
    MOVING_BACKWARD: 9,
    MOVING_LEFT: 10,
    MOVING_RIGHT: 11
};

let actor$1;
let transform$1;
const jump = (entity) => {
    console.log("Jump!");
    addState(entity, { state: DefaultStateTypes.JUMPING });
    actor$1 = entity.getMutableComponent(Actor);
    actor$1.jump.t = 0;
};
const jumping = (entity, args, delta) => {
    transform$1 = entity.getComponent(TransformComponent);
    actor$1 = entity.getMutableComponent(Actor);
    actor$1.jump.t += delta;
    if (actor$1.jump.t < actor$1.jump.duration) {
        transform$1.velocity[1] = transform$1.velocity[1] + Math.cos((actor$1.jump.t / actor$1.jump.duration) * Math.PI);
        console.log("Jumping: " + actor$1.jump.t);
        return;
    }
    removeState(entity, { state: DefaultStateTypes.JUMPING });
    console.log("Jumped");
};

// Input inherits from BehaviorComponent, which adds .map and .data
class Input extends BehaviorComponent {
}
// Set schema to itself plus gamepad data
Input.schema = Object.assign(Object.assign({}, Input.schema), { gamepadConnected: { type: Types.Boolean, default: false }, gamepadThreshold: { type: Types.Number, default: 0.1 }, gamepadButtons: { type: Types.Array, default: [] }, gamepadInput: { type: Types.Array, default: [] } });

// Button -- discrete states of ON and OFF, like a button
// OneD -- one dimensional value between 0 and 1, or -1 and 1, like a trigger
// TwoD -- Two dimensional value with x: -1, 1 and y: -1, 1 like a mouse input
// ThreeD -- Three dimensional value, just in case
// FourD -- Four dimensional value, for quaternions like rotation
// 6DOF -- Six dimensional input, three for pose and three for rotation (in euler?), i.e. for VR controllers
var InputType;
(function (InputType) {
    InputType[InputType["BUTTON"] = 0] = "BUTTON";
    InputType[InputType["ONED"] = 1] = "ONED";
    InputType[InputType["TWOD"] = 2] = "TWOD";
    InputType[InputType["THREED"] = 3] = "THREED";
    InputType[InputType["FOURD"] = 4] = "FOURD";
    InputType[InputType["SIXDOF"] = 5] = "SIXDOF";
})(InputType || (InputType = {}));

class Crouching extends TagComponent {
}

class Sprinting extends TagComponent {
}

let input;
let actor$2;
let transform$2;
let inputValue; // Could be a (small) source of garbage
let outputSpeed;
const move = (entity, args, delta) => {
    input = entity.getComponent(Input);
    actor$2 = entity.getComponent(Actor);
    transform$2 = entity.getMutableComponent(TransformComponent);
    const movementModifer = entity.hasComponent(Crouching) ? 0.5 : entity.hasComponent(Sprinting) ? 1.5 : 1.0;
    const inputType = args.inputType;
    outputSpeed = actor$2.accelerationSpeed * delta * movementModifer;
    if (inputType === InputType.TWOD) {
        inputValue = args.value;
        transform$2.velocity[0] = Math.min(transform$2.velocity[0] + inputValue[0] * outputSpeed, actor$2.maxSpeed);
        transform$2.velocity[2] = Math.min(transform$2.velocity[2] + inputValue[1] * outputSpeed, actor$2.maxSpeed);
    }
    else if (inputType === InputType.THREED) {
        inputValue = input.data.get(args.input).value;
        transform$2.velocity[0] = Math.min(transform$2.velocity[0] + inputValue[0] * outputSpeed, actor$2.maxSpeed);
        transform$2.velocity[1] = Math.min(transform$2.velocity[1] + inputValue[1] * outputSpeed, actor$2.maxSpeed);
        transform$2.velocity[2] = Math.min(transform$2.velocity[2] + inputValue[2] * outputSpeed, actor$2.maxSpeed);
    }
    else {
        console.error("Movement is only available for 2D and 3D inputs");
    }
    console.log("Moved");
};

let actor$3;
let transform$3;
let inputValue$1;
let startValue;
let q = [0, 0, 0, 0];
const qOut = [0, 0, 0, 0];
const rotateAround = (entity, args, delta) => {
    let inputComponent;
    inputComponent = entity.getComponent(Input);
    actor$3 = entity.getComponent(Actor);
    transform$3 = entity.getMutableComponent(TransformComponent);
    let mouseDownPosition = inputComponent.data.get(inputComponent.map.mouseInputMap.axes["mouseClickDownPosition"]);
    let originalRotation = inputComponent.data.get(inputComponent.map.mouseInputMap.axes["mouseClickDownTransformRotation"]);
    if (mouseDownPosition == undefined || originalRotation == undefined)
        return;
    if (!inputComponent.data.has(args.input)) {
        inputComponent.data.set(args.input, { type: args.inputType, value: create$1() });
    }
    set$1(qOut, originalRotation.value[0], originalRotation.value[1], originalRotation.value[2], originalRotation.value[3]);
    if (args.inputType === InputType.TWOD) {
        if (inputComponent.data.has(args.input)) {
            inputValue$1 = inputComponent.data.get(args.input).value;
            startValue = mouseDownPosition.value;
            rotateY(qOut, qOut, (inputValue$1[0] - startValue[0]) * Math.PI);
            rotateX(qOut, qOut, -(inputValue$1[1] - startValue[1]) * Math.PI);
        }
    }
    else if (args.inputType === InputType.THREED) {
        inputValue$1 = inputComponent.data.get(args.input).value;
        fromEuler(q, inputValue$1[0] * actor$3.rotationSpeedY * delta, inputValue$1[1] * actor$3.rotationSpeedX * delta, inputValue$1[2] * actor$3.rotationSpeedZ * delta);
    }
    else {
        console.error("Rotation is only available for 2D and 3D inputs");
    }
    transform$3.rotation = [qOut[0], qOut[1], qOut[2], qOut[3]];
    console.log("rotated ");
};

const _output = [0, 0, 0];
let transform$4;
const updatePosition = (entity, args, delta) => {
    transform$4 = entity.getMutableComponent(TransformComponent);
    if (length(transform$4.velocity) > 0.001) {
        scale(_output, transform$4.velocity, delta);
        add(transform$4.position, transform$4.position, _output);
    }
};

class TransformComponentSystem extends System {
    execute(delta, time) {
        var _a, _b;
        (_a = this.queries.transforms.added) === null || _a === void 0 ? void 0 : _a.forEach(entity => {
            updateTransform(entity);
        });
        (_b = this.queries.transforms.changed) === null || _b === void 0 ? void 0 : _b.forEach(entity => {
            updateTransform(entity);
        });
    }
}
TransformComponentSystem.queries = {
    transforms: {
        components: [Transform, TransformComponent],
        listen: {
            added: true,
            changed: true,
            removed: true
        }
    }
};
function updateTransform(entity) {
    const armadaTransform = entity.getComponent(TransformComponent);
    const transform = entity.getMutableComponent(Transform);
    const input = entity.getMutableComponent(Input);
    let pos = armadaTransform.position;
    let rot = armadaTransform.rotation;
    let rotQuat = new Quaternion(rot[0], rot[1], rot[2], rot[3]);
    let rotEuler = new Euler();
    rotEuler.setFromQuaternion(rotQuat);
    transform.position.set(pos[0], pos[1], pos[2]);
    transform.rotation.set(rotEuler.x, rotEuler.y, rotEuler.z);
}

var Thumbsticks;
(function (Thumbsticks) {
    Thumbsticks[Thumbsticks["Left"] = 0] = "Left";
    Thumbsticks[Thumbsticks["Right"] = 1] = "Right";
})(Thumbsticks || (Thumbsticks = {}));

// Local reference to input component
let input$1;
const _value = [0, 0];
// System behavior called whenever the mouse pressed
const handleMouseMovement = (entity, args) => {
    input$1 = entity.getComponent(Input);
    _value[0] = (args.event.clientX / window.innerWidth) * 2 - 1;
    _value[1] = (args.event.clientY / window.innerHeight) * -2 + 1;
    // Set type to TWOD (two-dimensional axis) and value to a normalized -1, 1 on X and Y
    input$1.data.set(input$1.map.mouseInputMap.axes["mousePosition"], {
        type: InputType.TWOD,
        value: _value
    });
};
// System behavior called when a mouse button is fired
const handleMouseButton = (entity, args) => {
    // Get immutable reference to Input and check if the button is defined -- ignore undefined buttons
    input$1 = entity.getComponent(Input);
    if (input$1.map.mouseInputMap.buttons[args.event.button] === undefined)
        return; // Set type to BUTTON (up/down discrete state) and value to up or down, as called by the DOM mouse events
    if (args.value === BinaryValue.ON) {
        console.log("Mouse button down: " + args.event.button);
        let transform = entity.getComponent(TransformComponent);
        input$1.data.set(input$1.map.mouseInputMap.buttons[args.event.button], {
            type: InputType.BUTTON,
            value: args.value
        });
        const mousePosition = [0, 0];
        mousePosition[0] = (args.event.clientX / window.innerWidth) * 2 - 1;
        mousePosition[1] = (args.event.clientY / window.innerHeight) * -2 + 1;
        const transformRotation = [
            transform.rotation[0],
            transform.rotation[1],
            transform.rotation[2],
            transform.rotation[3]
        ];
        input$1.data.set(input$1.map.mouseInputMap.axes["mouseClickDownPosition"], {
            type: InputType.TWOD,
            value: mousePosition
        });
        input$1.data.set(input$1.map.mouseInputMap.axes["mouseClickDownTransformRotation"], {
            type: InputType.FOURD,
            value: transformRotation
        });
    }
    else {
        console.log("Mouse button up" + args.event.button);
        input$1.data.delete(input$1.map.mouseInputMap.buttons[args.event.button]);
        input$1.data.delete(input$1.map.mouseInputMap.axes["mouseClickDownPosition"]);
        input$1.data.delete(input$1.map.mouseInputMap.axes["mouseClickDownTransformRotation"]);
    }
};
// System behavior called when a keyboard key is pressed
function handleKey(entity, args) {
    // Get immutable reference to Input and check if the button is defined -- ignore undefined keys
    input$1 = entity.getComponent(Input);
    if (input$1.map.keyboardInputMap[args.event.key] === undefined)
        return;
    // If the key is in the map but it's in the same state as now, let's skip it (debounce)
    if (input$1.data.has(input$1.map.keyboardInputMap[args.event.key]) && input$1.data.get(input$1.map.keyboardInputMap[args.event.key]).value === args.value)
        return;
    // Set type to BUTTON (up/down discrete state) and value to up or down, depending on what the value is set to
    if (args.value === BinaryValue.ON) {
        console.log("Key down: " + args.event.key);
        input$1.data.set(input$1.map.keyboardInputMap[args.event.key], {
            type: InputType.BUTTON,
            value: args.value
        });
    }
    else {
        console.log("Key up: " + args.event.key);
        input$1.data.delete(input$1.map.mouseInputMap.buttons[args.event.key]);
        input$1.data.set(input$1.map.keyboardInputMap[args.event.key], {
            type: InputType.BUTTON,
            value: args.value
        });
    }
}

/**
 *
 * @param value -1 to 1
 * @param threshold 0 to 1
 */
function applyThreshold(value, threshold) {
    if (threshold >= 1) {
        return 0;
    }
    if (value < threshold && value > -threshold) {
        return 0;
    }
    return (Math.sign(value) * (Math.abs(value) - threshold)) / (1 - threshold);
}

const inputPerGamepad = 2;
let input$2;
let gamepads;
let input0;
let input1;
let gamepad;
let inputBase;
let x;
let y;
let prevLeftX;
let prevLeftY;
let _index; // temp var for iterator loops
// System behavior to handle gamepad input
const handleGamepads = (entity) => {
    if (!input$2.gamepadConnected)
        return;
    // Get an immutable reference to input
    input$2 = entity.getComponent(Input);
    // Get gamepads from the DOM
    gamepads = navigator.getGamepads();
    // Loop over connected gamepads
    for (_index = 0; _index < gamepads.length; _index++) {
        // If there's no gamepad at this index, skip
        if (!gamepads[_index])
            return;
        // Hold reference to this gamepad
        gamepad = gamepads[_index];
        // If the gamepad has analog inputs (dpads that aren't up UP/DOWN/L/R but have -1 to 1 values for X and Y)
        if (gamepad.axes) {
            input0 = inputPerGamepad * _index;
            input1 = inputPerGamepad * _index + 1;
            // GamePad 0 LStick XY
            if (input$2.map.eventBindings.input[input0] && gamepad.axes.length >= inputPerGamepad)
                handleGamepadAxis(entity, { gamepad: gamepad, inputIndex: 0, mappedInputValue: input$2.map.gamepadInputMap.axes[input0] });
            // GamePad 1 LStick XY
            if (input$2.map.gamepadInputMap.axes[input1] && gamepad.axes.length >= inputPerGamepad * 2)
                handleGamepadAxis(entity, { gamepad, inputIndex: 1, mappedInputValue: input$2.map.gamepadInputMap.axes[input1] });
        }
        // If the gamepad doesn't have buttons, or the input isn't mapped, return
        if (!gamepad.buttons || !input$2.map.gamepadInputMap.axes)
            return;
        // Otherwise, loop through gamepad buttons
        for (_index = 0; _index < gamepad.buttons.length; _index++) {
            handleGamepadButton(entity, { gamepad, index: _index, mappedInputValue: input$2.map.gamepadInputMap.axes[input1] });
        }
    }
};
const handleGamepadButton = (entity, args) => {
    // Get mutable component reference
    input$2 = entity.getMutableComponent(Input);
    // Make sure button is in the map
    if (typeof input$2.map.gamepadInputMap.axes[args.index] === "undefined" ||
        gamepad.buttons[args.index].touched === (input$2.gamepadButtons[args.index] === BinaryValue.ON))
        return;
    // Set input data
    input$2.data.set(input$2.map.gamepadInputMap.axes[args.index], {
        type: InputType.BUTTON,
        value: gamepad.buttons[args.index].touched ? BinaryValue.ON : BinaryValue.OFF
    });
    input$2.gamepadButtons[args.index] = gamepad.buttons[args.index].touched ? 1 : 0;
};
const handleGamepadAxis = (entity, args) => {
    // get immutable component reference
    input$2 = entity.getComponent(Input);
    inputBase = args.inputIndex * 2;
    x = applyThreshold(gamepad.axes[inputBase], input$2.gamepadThreshold);
    y = applyThreshold(gamepad.axes[inputBase + 1], input$2.gamepadThreshold);
    prevLeftX = input$2.gamepadInput[inputBase];
    prevLeftY = input$2.gamepadInput[inputBase + 1];
    // Axis has changed, so get mutable reference to Input and set data
    if (x !== prevLeftX || y !== prevLeftY) {
        entity.getMutableComponent(Input).data.set(args.mappedInputValue, {
            type: InputType.TWOD,
            value: [x, y]
        });
        input$2.gamepadInput[inputBase] = x;
        input$2.gamepadInput[inputBase + 1] = y;
    }
};
// When a gamepad connects
const handleGamepadConnected = (entity, args) => {
    input$2 = entity.getMutableComponent(Input);
    console.log("A gamepad connected:", args.event.gamepad, args.event.gamepad.mapping);
    if (args.event.gamepad.mapping !== "standard")
        return console.error("Non-standard gamepad mapping detected, not properly handled");
    input$2.gamepadConnected = true;
    gamepad = args.event.gamepad;
    for (let index = 0; index < gamepad.buttons.length; index++) {
        if (typeof input$2.gamepadButtons[index] === "undefined")
            input$2.gamepadButtons[index] = 0;
    }
};
// When a gamepad disconnects
const handleGamepadDisconnected = (entity, args) => {
    input$2 = entity.getMutableComponent(Input);
    console.log("A gamepad disconnected:", args.event.gamepad);
    input$2.gamepadConnected = false;
    if (!input$2.map)
        return; // Already disconnected?
    for (let index = 0; index < input$2.gamepadButtons.length; index++) {
        if (input$2.gamepadButtons[index] === BinaryValue.ON && typeof input$2.map.gamepadInputMap.axes[index] !== "undefined") {
            input$2.data.set(input$2.map.gamepadInputMap.axes[index], {
                type: InputType.BUTTON,
                value: BinaryValue.OFF
            });
        }
        input$2.gamepadButtons[index] = 0;
    }
};

var GamepadButtons;
(function (GamepadButtons) {
    GamepadButtons[GamepadButtons["A"] = 0] = "A";
    GamepadButtons[GamepadButtons["B"] = 1] = "B";
    GamepadButtons[GamepadButtons["X"] = 2] = "X";
    GamepadButtons[GamepadButtons["Y"] = 3] = "Y";
    GamepadButtons[GamepadButtons["LBumper"] = 4] = "LBumper";
    GamepadButtons[GamepadButtons["RBumper"] = 5] = "RBumper";
    GamepadButtons[GamepadButtons["LTrigger"] = 6] = "LTrigger";
    GamepadButtons[GamepadButtons["RTrigger"] = 7] = "RTrigger";
    GamepadButtons[GamepadButtons["Back"] = 8] = "Back";
    GamepadButtons[GamepadButtons["Start"] = 9] = "Start";
    GamepadButtons[GamepadButtons["LStick"] = 10] = "LStick";
    GamepadButtons[GamepadButtons["RString"] = 11] = "RString";
    GamepadButtons[GamepadButtons["DPad1"] = 12] = "DPad1";
    GamepadButtons[GamepadButtons["DPad2"] = 13] = "DPad2";
    GamepadButtons[GamepadButtons["DPad3"] = 14] = "DPad3";
    GamepadButtons[GamepadButtons["DPad4"] = 15] = "DPad4";
})(GamepadButtons || (GamepadButtons = {}));

function preventDefault(e) {
    event.preventDefault();
}

const keys = { 37: 1, 38: 1, 39: 1, 40: 1 };
function preventDefault$1(e) {
    e.preventDefault();
}
function preventDefaultForScrollKeys(e) {
    if (keys[e.keyCode]) {
        preventDefault$1(e);
        return false;
    }
}
// modern Chrome requires { passive: false } when adding event
let supportsPassive = false;
try {
    window.addEventListener("test", null, Object.defineProperty({}, "passive", {
        get: function () {
            supportsPassive = true;
        }
    }));
    // eslint-disable-next-line no-empty
}
catch (e) { }
const wheelOpt = supportsPassive ? { passive: false } : false;
const wheelEvent = "onwheel" in document.createElement("div") ? "wheel" : "mousewheel";
// call this to Disable
function disableScroll() {
    window.addEventListener("DOMMouseScroll", preventDefault$1, false); // older FF
    window.addEventListener(wheelEvent, preventDefault$1, wheelOpt); // modern desktop
    window.addEventListener("touchmove", preventDefault$1, wheelOpt); // mobile
    window.addEventListener("keydown", preventDefaultForScrollKeys, false);
}
// call this to Enable
function enableScroll() {
    window.removeEventListener("DOMMouseScroll", preventDefault$1, false);
    window.removeEventListener(wheelEvent, preventDefault$1);
    window.removeEventListener("touchmove", preventDefault$1);
    window.removeEventListener("keydown", preventDefaultForScrollKeys, false);
}

const updateMovementState = (entity, args, delta) => {
    let input = entity.getComponent(Input);
    let state = entity.getMutableComponent(State);
    let moving = false;
    const movementInputs = [
        DefaultInput.FORWARD,
        DefaultInput.BACKWARD,
        // DefaultInput.UP,
        // DefaultInput.DOWN,
        DefaultInput.LEFT,
        DefaultInput.RIGHT
    ];
    movementInputs.forEach(direction => {
        var _a;
        if (((_a = input.data.get(direction)) === null || _a === void 0 ? void 0 : _a.value) == BinaryValue.ON)
            moving = true;
    });
    const movementState = moving ? DefaultStateTypes.MOVING : DefaultStateTypes.IDLE;
    addState(entity, { state: movementState });
};

const MouseButtons = {
    LeftButton: 0,
    MiddleButton: 1,
    RightButton: 2
};

const rotateStart = (entity, args, delta) => {
    console.log('rotateStart');
};

// Abstract inputs that all input devices get mapped to
const DefaultInput = {
    PRIMARY: 0,
    SECONDARY: 1,
    FORWARD: 2,
    BACKWARD: 3,
    UP: 4,
    DOWN: 5,
    LEFT: 6,
    RIGHT: 7,
    INTERACT: 8,
    CROUCH: 9,
    JUMP: 10,
    WALK: 11,
    RUN: 12,
    SPRINT: 13,
    SNEAK: 14,
    SCREENXY: 15,
    SCREENXY_START: 16,
    ROTATION_START: 17,
    MOVEMENT_PLAYERONE: 18,
    LOOKTURN_PLAYERONE: 19,
    MOVEMENT_PLAYERTWO: 20,
    LOOKTURN_PLAYERTWO: 21,
    ALTERNATE: 22
};
const DefaultInputMap = {
    // When an Input component is added, the system will call this array of behaviors
    onAdded: [
        {
            behavior: disableScroll
            // args: { }
        }
    ],
    // When an Input component is removed, the system will call this array of behaviors
    onRemoved: [
        {
            behavior: enableScroll
            // args: { }
        }
    ],
    // When the input component is added or removed, the system will bind/unbind these events to the DOM
    eventBindings: {
        // Mouse
        ["contextmenu"]: {
            behavior: preventDefault
        },
        ["mousemove"]: {
            behavior: handleMouseMovement,
            args: {
                value: DefaultInput.SCREENXY
            }
        },
        ["mouseup"]: {
            behavior: handleMouseButton,
            args: {
                value: BinaryValue.OFF
            }
        },
        ["mousedown"]: {
            behavior: handleMouseButton,
            args: {
                value: BinaryValue.ON
            }
        },
        // Keys
        ["keyup"]: {
            behavior: handleKey,
            args: {
                value: BinaryValue.OFF
            }
        },
        ["keydown"]: {
            behavior: handleKey,
            args: {
                value: BinaryValue.ON
            }
        },
        // Gamepad
        ["gamepadconnected"]: {
            behavior: handleGamepadConnected
        },
        ["gamepaddisconnected"]: {
            behavior: handleGamepadDisconnected
        }
    },
    // Map mouse buttons to abstract input
    mouseInputMap: {
        buttons: {
            [MouseButtons.LeftButton]: DefaultInput.PRIMARY,
            [MouseButtons.RightButton]: DefaultInput.SECONDARY
            // [MouseButtons.MiddleButton]: DefaultInput.INTERACT
        },
        axes: {
            mousePosition: DefaultInput.SCREENXY,
            mouseClickDownPosition: DefaultInput.SCREENXY_START,
            mouseClickDownTransformRotation: DefaultInput.ROTATION_START
        }
    },
    // Map gamepad buttons to abstract input
    gamepadInputMap: {
        buttons: {
            [GamepadButtons.A]: DefaultInput.JUMP,
            [GamepadButtons.B]: DefaultInput.CROUCH,
            // [GamepadButtons.X]: DefaultInput.SPRINT, // X - secondary input
            // [GamepadButtons.Y]: DefaultInput.INTERACT, // Y - tertiary input
            // 4: DefaultInput.DEFAULT, // LB
            // 5: DefaultInput.DEFAULT, // RB
            // 6: DefaultInput.DEFAULT, // LT
            // 7: DefaultInput.DEFAULT, // RT
            // 8: DefaultInput.DEFAULT, // Back
            // 9: DefaultInput.DEFAULT, // Start
            // 10: DefaultInput.DEFAULT, // LStick
            // 11: DefaultInput.DEFAULT, // RStick
            [GamepadButtons.DPad1]: DefaultInput.FORWARD,
            [GamepadButtons.DPad2]: DefaultInput.BACKWARD,
            [GamepadButtons.DPad3]: DefaultInput.LEFT,
            [GamepadButtons.DPad4]: DefaultInput.RIGHT // DPAD 4
        },
        axes: {
            [Thumbsticks.Left]: DefaultInput.MOVEMENT_PLAYERONE,
            [Thumbsticks.Right]: DefaultInput.LOOKTURN_PLAYERONE
        }
    },
    // Map keyboard buttons to abstract input
    keyboardInputMap: {
        w: DefaultInput.FORWARD,
        a: DefaultInput.LEFT,
        s: DefaultInput.BACKWARD,
        d: DefaultInput.RIGHT,
        [" "]: DefaultInput.JUMP,
        shift: DefaultInput.CROUCH
    },
    // Map how inputs relate to each other
    inputRelationships: {
        [DefaultInput.FORWARD]: { opposes: [DefaultInput.BACKWARD] },
        [DefaultInput.BACKWARD]: { opposes: [DefaultInput.FORWARD] },
        [DefaultInput.LEFT]: { opposes: [DefaultInput.RIGHT] },
        [DefaultInput.RIGHT]: { opposes: [DefaultInput.LEFT] },
        [DefaultInput.CROUCH]: { blockedBy: [DefaultInput.JUMP, DefaultInput.SPRINT] },
        [DefaultInput.JUMP]: { overrides: [DefaultInput.CROUCH] }
    },
    // "Button behaviors" are called when button input is called (i.e. not axis input)
    inputButtonBehaviors: {
        [DefaultInput.JUMP]: {
            [BinaryValue.ON]: {
                behavior: jump,
                args: {}
            }
        },
        [DefaultInput.FORWARD]: {
            [BinaryValue.ON]: {
                behavior: move,
                args: {
                    inputType: InputType.TWOD,
                    input: {
                        value: [0, -1]
                    },
                    value: [0, -1]
                }
            },
            [BinaryValue.OFF]: {
                behavior: updateMovementState,
                args: {},
            }
        },
        [DefaultInput.BACKWARD]: {
            [BinaryValue.ON]: {
                behavior: move,
                args: {
                    inputType: InputType.TWOD,
                    input: {
                        value: [0, 1]
                    },
                    value: [0, 1]
                }
            },
            [BinaryValue.OFF]: {
                behavior: updateMovementState,
                args: {},
            }
        },
        [DefaultInput.LEFT]: {
            [BinaryValue.ON]: {
                behavior: move,
                args: {
                    inputType: InputType.TWOD,
                    input: {
                        value: [-1, 0]
                    },
                    value: [-1, 0]
                },
            },
            [BinaryValue.OFF]: {
                behavior: updateMovementState,
                args: {},
            }
        },
        [DefaultInput.RIGHT]: {
            [BinaryValue.ON]: {
                behavior: move,
                args: {
                    inputType: InputType.TWOD,
                    input: {
                        value: [1, 0]
                    },
                    value: [1, 0]
                }
            },
            [BinaryValue.OFF]: {
                behavior: updateMovementState,
                args: {},
            }
        },
    },
    // Axis behaviors are called by continuous input and map to a scalar, vec2 or vec3
    inputAxisBehaviors: {
        [DefaultInput.MOVEMENT_PLAYERONE]: {
            behavior: move,
            args: {
                input: DefaultInput.MOVEMENT_PLAYERONE,
                inputType: InputType.TWOD
            }
        },
        [DefaultInput.SCREENXY]: {
            behavior: rotateAround,
            args: {
                input: DefaultInput.SCREENXY,
                inputType: InputType.TWOD
            }
        },
        [DefaultInput.SCREENXY_START]: {
            behavior: rotateStart,
            args: {
                inputType: InputType.TWOD
            }
        }
    }
};

class InputSystem extends System {
    execute(delta) {
        // Called when input component is added to entity
        this.queries.inputs.added.forEach(entity => {
            var _a;
            // Get component reference
            this._inputComponent = entity.getComponent(Input);
            // If input doesn't have a map, set the default
            if (this._inputComponent.map === undefined)
                this._inputComponent.map = DefaultInputMap;
            // Call all behaviors in "onAdded" of input map
            this._inputComponent.map.onAdded.forEach(behavior => {
                behavior.behavior(entity, Object.assign({}, behavior.args));
            });
            // Bind DOM events to event behavior
            (_a = Object.keys(this._inputComponent.map.eventBindings)) === null || _a === void 0 ? void 0 : _a.forEach((key) => {
                document.addEventListener(key, e => {
                    this._inputComponent.map.eventBindings[key].behavior(entity, Object.assign({ event: e }, this._inputComponent.map.eventBindings[key].args));
                });
            });
        });
        // Called when input component is removed from entity
        this.queries.inputs.removed.forEach(entity => {
            // Get component reference
            this._inputComponent = entity.getComponent(Input);
            // Call all behaviors in "onRemoved" of input map
            this._inputComponent.map.onRemoved.forEach(behavior => {
                behavior.behavior(entity, behavior.args);
            });
            // Unbind events from DOM
            Object.keys(this._inputComponent.map.eventBindings).forEach((key) => {
                document.addEventListener(key, e => {
                    this._inputComponent.map.eventBindings[key].behavior(entity, Object.assign({ event: e }, this._inputComponent.map.eventBindings[key].args));
                });
            });
        });
        // Called every frame on all input components
        this.queries.inputs.results.forEach(entity => handleInput(entity, delta));
    }
}
const handleInput = (entity, delta) => {
    let input;
    input = entity.getMutableComponent(Input);
    input.data.forEach((value, key) => {
        if (value.type === InputType.BUTTON) {
            if (input.map.inputButtonBehaviors[key] && input.map.inputButtonBehaviors[key][value.value]) {
                if (value.lifecycleState === undefined || value.lifecycleState === LifecycleValue$1.STARTED) {
                    input.data.set(key, {
                        type: value.type,
                        value: value.value,
                        lifecycleState: LifecycleValue$1.CONTINUED
                    });
                    input.map.inputButtonBehaviors[key][value.value].behavior(entity, input.map.inputButtonBehaviors[key][value.value].args, delta);
                }
            }
        }
        else if (value.type === InputType.ONED || value.type === InputType.TWOD || value.type === InputType.THREED ||
            value.type === InputType.FOURD) {
            if (input.map.inputAxisBehaviors[key]) {
                if (value.lifecycleState === undefined || value.lifecycleState === LifecycleValue$1.STARTED) {
                    input.data.set(key, {
                        type: value.type,
                        value: value.value,
                        lifecycleState: LifecycleValue$1.CONTINUED
                    });
                    input.map.inputAxisBehaviors[key].behavior(entity, input.map.inputAxisBehaviors[key].args, delta);
                }
            }
        }
        else {
            console.error("handleInput called with an invalid input type");
        }
    });
};
InputSystem.queries = {
    inputs: {
        components: [Input],
        listen: {
            added: true,
            removed: true
        }
    }
};

const jumpingBehavior = jumping;
const DefaultStateGroups = {
    MOVEMENT: 0,
    MOVEMENT_MODIFIERS: 1
};
const DefaultStateMap = {
    groups: {
        [DefaultStateGroups.MOVEMENT]: {
            exclusive: true,
            default: DefaultStateTypes.IDLE,
            states: [DefaultStateTypes.IDLE, DefaultStateTypes.MOVING]
        },
        [DefaultStateGroups.MOVEMENT_MODIFIERS]: {
            exclusive: true,
            states: [DefaultStateTypes.CROUCHING, DefaultStateTypes.SPRINTING, DefaultStateTypes.JUMPING]
        }
    },
    states: {
        [DefaultStateTypes.IDLE]: { group: DefaultStateGroups.MOVEMENT, onUpdate: { behavior: decelerate } },
        [DefaultStateTypes.MOVING]: {
            group: DefaultStateGroups.MOVEMENT
        },
        [DefaultStateTypes.JUMPING]: { group: DefaultStateGroups.MOVEMENT_MODIFIERS, onUpdate: { behavior: jumpingBehavior } },
        [DefaultStateTypes.CROUCHING]: { group: DefaultStateGroups.MOVEMENT_MODIFIERS, blockedBy: DefaultStateTypes.JUMPING },
        [DefaultStateTypes.SPRINTING]: { group: DefaultStateGroups.MOVEMENT_MODIFIERS }
    }
};

class StateSystem extends System {
    constructor() {
        super(...arguments);
        this.callBehaviors = (entity, args, delta) => {
            this._state = entity.getComponent(State);
            this._state.data.forEach((stateValue) => {
                if (this._state.map.states[stateValue.state] !== undefined && this._state.map.states[stateValue.state][args.phase] !== undefined) {
                    if (stateValue.lifecycleState === LifecycleValue$1.STARTED) {
                        this._state.data.set(stateValue.state, Object.assign(Object.assign({}, stateValue), { lifecycleState: LifecycleValue$1.CONTINUED }));
                    }
                    this._state.map.states[stateValue.state][args.phase].behavior(entity, this._state.map.states[stateValue.state][args.phase].args, delta);
                }
            });
        };
    }
    execute(delta, time) {
        var _a, _b, _c;
        (_a = this.queries.state.added) === null || _a === void 0 ? void 0 : _a.forEach(entity => {
            var _a;
            // If stategroup has a default, add it to our state map
            this._state = entity.getComponent(State);
            if (this._state.map === undefined)
                return;
            Object.keys((_a = this._state.map) === null || _a === void 0 ? void 0 : _a.groups).forEach((stateGroup) => {
                if (this._state.map.groups[stateGroup] !== undefined && this._state.map.groups[stateGroup].default !== undefined) {
                    addState(entity, { state: this._state.map.groups[stateGroup].default });
                    console.log("Added default state: " + this._state.map.groups[stateGroup].default);
                }
            });
        });
        (_b = this.queries.state.changed) === null || _b === void 0 ? void 0 : _b.forEach(entity => {
            var _a;
            // If stategroup has a default, add it to our state map
            this._state = entity.getComponent(State);
            if (this._state.map === undefined)
                return;
            Object.keys((_a = this._state.map) === null || _a === void 0 ? void 0 : _a.groups).forEach((stateGroup) => {
                if (this._state.map.groups[stateGroup] !== undefined && this._state.map.groups[stateGroup].default !== undefined) {
                    addState(entity, { state: this._state.map.groups[stateGroup].default });
                    console.log("Added default state: " + this._state.map.groups[stateGroup].default);
                }
            });
        });
        (_c = this.queries.state.results) === null || _c === void 0 ? void 0 : _c.forEach(entity => {
            this.callBehaviors(entity, { phase: "onUpdate" }, delta);
            this.callBehaviors(entity, { phase: "onLateUpdate" }, delta);
        });
    }
}
StateSystem.queries = {
    state: {
        components: [State],
        listen: {
            added: true,
            changed: true,
            removed: true
        }
    }
};

const isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";

class Subscription extends BehaviorComponent {
}

class SubscriptionSystem extends System {
    constructor() {
        super(...arguments);
        // TODO: Make this a generic behavior and move to common
        this.callBehaviorsForHook = (entity, args, delta) => {
            this.subscription = entity.getComponent(Subscription);
            if (this.subscription.map[args.phase] !== undefined) {
                this.subscription.map[args.phase].forEach((value) => {
                    value.behavior(entity, value.args ? value.args : null, delta);
                });
            }
        };
    }
    execute(delta, time) {
        var _a, _b, _c, _d;
        (_a = this.queries.subscriptions.added) === null || _a === void 0 ? void 0 : _a.forEach(entity => {
            this.callBehaviorsForHook(entity, { phase: "onAdded" }, delta);
        });
        (_b = this.queries.subscriptions.changed) === null || _b === void 0 ? void 0 : _b.forEach(entity => {
            this.callBehaviorsForHook(entity, { phase: "onChanged" }, delta);
        });
        (_c = this.queries.subscriptions.results) === null || _c === void 0 ? void 0 : _c.forEach(entity => {
            this.callBehaviorsForHook(entity, { phase: "onUpdate" }, delta);
            this.callBehaviorsForHook(entity, { phase: "onLateUpdate" }, delta);
        });
        (_d = this.queries.subscriptions.removed) === null || _d === void 0 ? void 0 : _d.forEach(entity => {
            this.callBehaviorsForHook(entity, { phase: "onRemoved" }, delta);
        });
    }
}
SubscriptionSystem.queries = {
    subscriptions: {
        components: [Subscription],
        listen: {
            added: true,
            changed: true,
            removed: true
        }
    }
};

const DefaultSubscriptionMap = {
    onUpdate: [
        {
            behavior: updatePosition
        }
    ]
};

const DEFAULT_OPTIONS = {
    debug: false,
    withTransform: false
};
function initializeInputSystems(world, options = DEFAULT_OPTIONS) {
    if (options.debug)
        console.log("Initializing input systems...");
    if (!isBrowser) {
        console.error("Couldn't initialize input, are you in a browser?");
        return null;
    }
    if (options.debug) {
        console.log("Registering input systems with the following options:");
        console.log(options);
    }
    world.registerSystem(InputSystem)
        .registerSystem(StateSystem)
        .registerSystem(SubscriptionSystem)
        .registerSystem(TransformComponentSystem);
    world
        .registerComponent(Input)
        .registerComponent(State)
        .registerComponent(Actor)
        .registerComponent(Subscription)
        .registerComponent(TransformComponent);
    if (options.withTransform)
        world.registerComponent(Transform);
    return world;
}
function initializeActor(entity, options, withTransform = false) {
    entity
        .addComponent(Input)
        .addComponent(State)
        .addComponent(Actor)
        .addComponent(Subscription)
        .addComponent(TransformComponent);
    // .addComponent(Transform)
    if (withTransform)
        entity.addComponent(Transform);
    // Custom Action Map
    if (options.inputMap) {
        console.log("Using input map:");
        console.log(options.inputMap);
        entity.getMutableComponent(Input).map = options.inputMap;
    }
    else {
        console.log("No input map provided, defaulting to default input");
        entity.getMutableComponent(Input).map = DefaultInputMap;
    }
    // Custom Action Map
    if (options.stateMap) {
        console.log("Using input map:");
        console.log(options.stateMap);
        entity.getMutableComponent(State).map = options.stateMap;
    }
    else {
        console.log("No state map provided, defaulting to default state");
        entity.getMutableComponent(State).map = DefaultStateMap;
    }
    // Custom Subscription Map
    if (options.subscriptionMap) {
        console.log("Using subscription map:");
        console.log(options.subscriptionMap);
        entity.getMutableComponent(Subscription).map = options.subscriptionMap;
    }
    else {
        console.log("No subscription map provided, defaulting to default subscriptions");
        entity.getMutableComponent(Subscription).map = DefaultSubscriptionMap;
    }
    return entity;
}

export { DefaultInput, DefaultInputMap, DefaultStateGroups, DefaultStateMap, DefaultStateTypes, GamepadButtons, InputType, MouseButtons, StateType, Thumbsticks, TransformComponent, addState, decelerate, handleGamepadAxis, handleGamepadConnected, handleGamepadDisconnected, handleGamepads, handleInput, handleKey, handleMouseButton, handleMouseMovement, hasState, initializeActor, initializeInputSystems, jump, jumping, move, removeState, rotateAround, toggleState, updatePosition };
//# sourceMappingURL=armada.js.map
