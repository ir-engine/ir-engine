import { isClient } from './isClient'

export const performance: Performance = isClient ? window.performance : require('perf_hooks').performance
