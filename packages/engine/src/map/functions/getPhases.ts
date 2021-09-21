import * as FetchTilesPhase from '../phases/FetchTilesPhase'
import * as ExtractTileFeaturesPhase from '../phases/ExtractTileFeaturesPhase'
import * as UnifyFeaturesPhase from '../phases/UnifyFeaturesPhase'
import * as CreateGeometryPhase from '../phases/CreateGeometryPhase'
import * as CreateCompleteObjectPhase from '../phases/CreateCompleteObjectPhase'
import * as CreateLabelPhase from '../phases/CreateLabelPhase'
import { IPhase } from '../types'

const phases = Object.freeze([
  FetchTilesPhase,
  ExtractTileFeaturesPhase,
  UnifyFeaturesPhase,
  CreateGeometryPhase,
  CreateCompleteObjectPhase,
  CreateLabelPhase
])

export default function getPhases(): readonly IPhase<any, any>[] {
  return phases
}
