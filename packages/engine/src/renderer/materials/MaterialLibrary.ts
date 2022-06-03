import AliasVortex, { DefaultArgs as AliasVortexDefaultArgs } from './constants/AliasVortex.mat'
import Caustics, { DefaultArgs as CausticsDefaultArgs } from './constants/Caustics.mat'
import Circuits, { DefaultArgs as CircuitsDefaultArgs } from './constants/Circuits.mat'
import Cubes, { DefaultArgs as CubesDefaultArgs } from './constants/Cubes.mat'
import Fireball, { DefaultArgs as FireballDefaultArgs } from './constants/Fireball.mat'
import Galaxy, { DefaultArgs as GalaxyDefaultArgs } from './constants/Galaxy.mat'
import Generators, { DefaultArgs as GeneratorsDefaultArgs } from './constants/Generators.mat'
import Noise_1, { DefaultArgs as Noise_1DefaultArgs } from './constants/Noise_1.mat'
import VoronoiClouds, { DefaultArgs as VoronoiCloudsDefaultArgs } from './constants/VoronoiClouds.mat'

export const MaterialLibrary = {
  AliasVortex: AliasVortex,
  Caustics: Caustics,
  Circuits: Circuits,
  Cubes: Cubes,
  Fireball: Fireball,
  Galaxy: Galaxy,
  Generators: Generators,
  Noise_1: Noise_1,
  VoronoiClouds: VoronoiClouds
}

export const DefaultArgs = {
  AliasVortex: AliasVortexDefaultArgs,
  Caustics: CausticsDefaultArgs,
  Circuits: CircuitsDefaultArgs,
  Cubes: CubesDefaultArgs,
  Fireball: FireballDefaultArgs,
  Galaxy: GalaxyDefaultArgs,
  Generators: GeneratorsDefaultArgs,
  Noise_1: Noise_1DefaultArgs,
  VoronoiClouds: VoronoiCloudsDefaultArgs
}
