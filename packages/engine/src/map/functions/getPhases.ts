import * as FetchTilesPhase from '../phases/FetchTilesPhase'
import * as ExtractTileFeaturesPhase from '../phases/ExtractTileFeaturesPhase'
import * as TransformFeaturePhase from '../phases/TransformFeaturePhase'
import * as UnifyFeaturesPhase from '../phases/UnifyFeaturesPhase'
import * as CreateGeometryPhase from '../phases/CreateGeometryPhase'
import * as CreateFallbackLanduseMeshPhase from '../phases/CreateFallbackLanduseMeshPhase'
import * as CreateTileNavMeshPhase from '../phases/CreateTileNavMeshPhase'
import * as CreateCompleteObjectPhase from '../phases/CreateCompleteObjectPhase'
import * as CreateCompleteNavMeshPhase from '../phases/CreateCompleteNavMeshPhase'
import * as CreateLabelPhase from '../phases/CreateLabelPhase'
import * as CreateHelpersPhase from '../phases/CreateHelpersPhase'
import { IPhase } from '../types'

const defaultPhases = Object.freeze([
  FetchTilesPhase,
  ExtractTileFeaturesPhase,
  UnifyFeaturesPhase,
  TransformFeaturePhase,
  CreateGeometryPhase,
  CreateFallbackLanduseMeshPhase,
  CreateTileNavMeshPhase,
  CreateCompleteObjectPhase,
  CreateCompleteNavMeshPhase,
  CreateLabelPhase,
  CreateHelpersPhase
])

const phasesNoNavigation = Object.freeze([
  FetchTilesPhase,
  ExtractTileFeaturesPhase,
  UnifyFeaturesPhase,
  TransformFeaturePhase,
  CreateGeometryPhase,
  CreateFallbackLanduseMeshPhase,
  CreateCompleteObjectPhase,
  CreateLabelPhase
])

type FeatureId = 'navigation'

export default function getPhases(options: { exclude?: FeatureId[] } = {}): readonly IPhase<any, any>[] {
  const exclude = options.exclude || []
  return exclude.includes('navigation') ? phasesNoNavigation : defaultPhases
}
