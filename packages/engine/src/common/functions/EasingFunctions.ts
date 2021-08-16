// Extracted from Tween.js
// https://github.com/tweenjs/tween.js/blob/master/src/Tween.js#L473
// https://github.com/tweenjs/tween.js/blob/master/LICENSE
// Originally based on Robert Penner's Easing Functions
// http://robertpenner.com/easing/
// http://robertpenner.com/easing_terms_of_use.html

// tslint:disable: no-conditional-assignment

export type EasingFunction = (k: number) => number

export function linear(k: number) {
  return k
}

export function quadraticIn(k: number) {
  return k * k
}

export function quadraticOut(k: number) {
  return k * (2 - k)
}

export function quadraticInOut(k: number) {
  if ((k *= 2) < 1) {
    return 0.5 * k * k
  }

  return -0.5 * (--k * (k - 2) - 1)
}

export function cubicIn(k: number) {
  return k * k * k
}

export function cubicOut(k: number) {
  return --k * k * k + 1
}

export function cubicInOut(k: number) {
  if ((k *= 2) < 1) {
    return 0.5 * k * k * k
  }

  return 0.5 * ((k -= 2) * k * k + 2)
}

export function quarticIn(k: number) {
  return k * k * k * k
}

export function quarticOut(k: number) {
  return 1 - --k * k * k * k
}

export function quarticInOut(k: number) {
  if ((k *= 2) < 1) {
    return 0.5 * k * k * k * k
  }

  return -0.5 * ((k -= 2) * k * k * k - 2)
}

export function quinticIn(k: number) {
  return k * k * k * k * k
}

export function quinticOut(k: number) {
  return --k * k * k * k * k + 1
}

export function quinticInOut(k: number) {
  if ((k *= 2) < 1) {
    return 0.5 * k * k * k * k * k
  }

  return 0.5 * ((k -= 2) * k * k * k * k + 2)
}

export function sinusoidalIn(k: number) {
  return 1 - Math.cos((k * Math.PI) / 2)
}

export function sinusoidalOut(k: number) {
  return Math.sin((k * Math.PI) / 2)
}

export function sinusoidalInOut(k: number) {
  return 0.5 * (1 - Math.cos(Math.PI * k))
}

export function exponentialIn(k: number) {
  return k === 0 ? 0 : Math.pow(1024, k - 1)
}

export function exponentialOut(k: number) {
  return k === 1 ? 1 : 1 - Math.pow(2, -10 * k)
}

export function exponentialInOut(k: number) {
  if (k === 0) {
    return 0
  }

  if (k === 1) {
    return 1
  }

  if ((k *= 2) < 1) {
    return 0.5 * Math.pow(1024, k - 1)
  }

  return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2)
}

export function circularIn(k: number) {
  return 1 - Math.sqrt(1 - k * k)
}

export function circularOut(k: number) {
  return Math.sqrt(1 - --k * k)
}

export function circularInOut(k: number) {
  if ((k *= 2) < 1) {
    return -0.5 * (Math.sqrt(1 - k * k) - 1)
  }

  return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1)
}

export function elasticIn(k: number) {
  if (k === 0) {
    return 0
  }

  if (k === 1) {
    return 1
  }

  return -Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI)
}

export function elasticOut(k: number) {
  if (k === 0) {
    return 0
  }

  if (k === 1) {
    return 1
  }

  return Math.pow(2, -10 * k) * Math.sin((k - 0.1) * 5 * Math.PI) + 1
}

export function elasticInOut(k: number) {
  if (k === 0) {
    return 0
  }

  if (k === 1) {
    return 1
  }

  k *= 2

  if (k < 1) {
    return -0.5 * Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI)
  }

  return 0.5 * Math.pow(2, -10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI) + 1
}

export function backIn(k: number) {
  const s = 1.70158

  return k * k * ((s + 1) * k - s)
}
export function backOut(k: number) {
  const s = 1.70158

  return --k * k * ((s + 1) * k + s) + 1
}

export function backInOut(k: number) {
  const s = 1.70158 * 1.525

  if ((k *= 2) < 1) {
    return 0.5 * (k * k * ((s + 1) * k - s))
  }

  return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2)
}

export function bounceIn(k: number) {
  return 1 - bounceOut(1 - k)
}

export function bounceOut(k: number) {
  if (k < 1 / 2.75) {
    return 7.5625 * k * k
  } else if (k < 2 / 2.75) {
    return 7.5625 * (k -= 1.5 / 2.75) * k + 0.75
  } else if (k < 2.5 / 2.75) {
    return 7.5625 * (k -= 2.25 / 2.75) * k + 0.9375
  } else {
    return 7.5625 * (k -= 2.625 / 2.75) * k + 0.984375
  }
}

export function bounceInOut(k: number) {
  if (k < 0.5) {
    return bounceIn(k * 2) * 0.5
  }

  return bounceOut(k * 2 - 1) * 0.5 + 0.5
}
