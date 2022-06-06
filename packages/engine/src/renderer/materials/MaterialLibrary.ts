import AliasVortex, { DefaultArgs as AliasVortexDefaultArgs } from './constants/AliasVortex.mat'
import Basic, { DefaultArgs as BasicDefaultArgs } from './constants/Basic.mat'
import Caustics, { DefaultArgs as CausticsDefaultArgs } from './constants/Caustics.mat'
import Circuits, { DefaultArgs as CircuitsDefaultArgs } from './constants/Circuits.mat'
import Cubes, { DefaultArgs as CubesDefaultArgs } from './constants/Cubes.mat'
import Fireball, { DefaultArgs as FireballDefaultArgs } from './constants/Fireball.mat'
import Galaxy, { DefaultArgs as GalaxyDefaultArgs } from './constants/Galaxy.mat'
import Generators, { DefaultArgs as GeneratorsDefaultArgs } from './constants/Generators.mat'
import Noise_1, { DefaultArgs as Noise_1DefaultArgs } from './constants/Noise_1.mat'
import Physical, { DefaultArgs as PhysicalDefaultArgs } from './constants/Physical.mat'
import Standard, { DefaultArgs as StandardDefaultArgs } from './constants/Standard.mat'
import VoronoiClouds, { DefaultArgs as VoronoiCloudsDefaultArgs } from './constants/VoronoiClouds.mat'

export const MaterialLibrary = {
  Generators: Generators,
  VoronoiClouds: VoronoiClouds,
  Caustics: Caustics,
  Physical: Physical,
  Cubes: Cubes,
  Galaxy: Galaxy,
  Fireball: Fireball,
  Standard: Standard,
  Circuits: Circuits,
  Basic: Basic,
  Noise_1: Noise_1,
  AliasVortex: AliasVortex
}

export const DefaultArguments = {
  Generators: GeneratorsDefaultArgs,
  VoronoiClouds: VoronoiCloudsDefaultArgs,
  Caustics: CausticsDefaultArgs,
  Physical: PhysicalDefaultArgs,
  Cubes: CubesDefaultArgs,
  Galaxy: GalaxyDefaultArgs,
  Fireball: FireballDefaultArgs,
  Standard: StandardDefaultArgs,
  Circuits: CircuitsDefaultArgs,
  Basic: BasicDefaultArgs,
  Noise_1: Noise_1DefaultArgs,
  AliasVortex: AliasVortexDefaultArgs
}
