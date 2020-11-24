const RND_BASIS = 0x100000000;

export function randomId () {
  return Math.random()
    .toString(36)
    .substr(2, 6);
}

export function createPseudoRandom (s) {
  let seed = s || Math.random() * RND_BASIS;

  return () => {
    seed = (1664525 * seed + 1013904223) % RND_BASIS;
    return seed / RND_BASIS;
  };
}

export function randomNumber (min, max, rndFn = Math.random) {
  if (typeof min === 'undefined') return undefined;
  if (typeof max === 'undefined') return min;

  return rndFn() * (max - min) + min;
}

export function randomObject (min, max, rndFn = Math.random) {
  if (!min) return {};
  if (!max) return min;

  const v = {};
  for (const k in min) {
    const typeofMin = typeof min[k];
    if (Array.isArray(min[k])) {
      v[k] = randomArray(min[k], max[k], rndFn);
    } else if (typeofMin === 'object') {
      v[k] = randomObject(min[k], max[k], rndFn);
    } else if (typeofMin === 'number') {
      v[k] = randomNumber(min[k], max[k], rndFn);
    } else {
      v[k] = min[k];
    }
  }
  return v;
}

export function randomArray (min, max, rndFn = Math.random) {
  if (!min) return [];
  if (!max) return min;

  const n = min.length;
  const v = Array(n);
  for (let i = 0; i < n; i++) {
    const typeofMin = typeof min[i];
    if (Array.isArray(min[i])) {
      v[i] = randomArray(min[i], max[i], rndFn);
    } else if (typeofMin === 'object') {
      v[i] = randomObject(min[i], max[i], rndFn);
    } else if (typeofMin === 'number') {
      v[i] = randomNumber(min[i], max[i], rndFn);
    } else {
      v[i] = min[i];
    }
  }
  return v;
}

export function randomize (min, max, rndFn = Math.random) {
  const typeofMin = typeof min;
  if (Array.isArray(min)) {
    return randomArray(min, max, rndFn);
  } else if (typeofMin === 'object') {
    return randomObject(min, max, rndFn);
  } else if (typeofMin === 'number') {
    return randomNumber(min, max, rndFn);
  } else {
    return min;
  }
}

export const randomBoxOffset = (dx, dy, dz, rndFn = Math.random) => {
  return {
    x: (rndFn() - 0.5) * dx,
    y: (rndFn() - 0.5) * dy,
    z: (rndFn() - 0.5) * dz
  };
};

// https://mathworld.wolfram.com/SpherePointPicking.html
// https://mathworld.wolfram.com/SphericalCoordinates.html
export const randomEllipsoidOffset = (rx, ry, rz, rndFn = Math.random) => {
  const theta = rndFn() * 2 * Math.PI;
  const phi = Math.acos(2 * rndFn() - 1);
  return {
    x: rx * Math.cos(theta) * Math.sin(phi),
    y: ry * Math.sin(theta) * Math.sin(phi),
    z: rz * Math.cos(phi)
  };
};

export const randomSphereOffset = (r, rndFn) => randomEllipsoidOffset(r, r, r, rndFn);
export const randomCubeOffset = (d, rndFn) => randomBoxOffset(d, d, d, rndFn);
