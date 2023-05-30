import { isClient } from './getEnvironment'

export const performance: Performance = isClient ? window.performance : require('perf_hooks').performance
