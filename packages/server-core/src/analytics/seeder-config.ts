import { KnexSeed } from '@etherealengine/common/src/interfaces/KnexSeed'

import * as analyticsSeed from './analytics/analytics.seed'

export const analyticsSeeds: Array<KnexSeed> = [analyticsSeed]
