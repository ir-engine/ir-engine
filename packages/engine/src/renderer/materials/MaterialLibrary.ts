import Basic, { DefaultArgs as BasicDefaultArgs } from './constants/Basic.mat'
import Lambert, { DefaultArgs as LambertDefaultArgs } from './constants/Lambert.mat'
import Matcap, { DefaultArgs as MatcapDefaultArgs } from './constants/Matcap.mat'
import Phong, { DefaultArgs as PhongDefaultArgs } from './constants/Phong.mat'
import Physical, { DefaultArgs as PhysicalDefaultArgs } from './constants/Physical.mat'
import Standard, { DefaultArgs as StandardDefaultArgs } from './constants/Standard.mat'
import Toon, { DefaultArgs as ToonDefaultArgs } from './constants/Toon.mat'

export const MaterialLibrary = {
  Basic: Basic,
  Lambert: Lambert,
  Matcap: Matcap,
  Phong: Phong,
  Physical: Physical,
  Standard: Standard,
  Toon: Toon
}

export const DefaultArguments = {
  Basic: BasicDefaultArgs,
  Lambert: LambertDefaultArgs,
  Matcap: MatcapDefaultArgs,
  Phong: PhongDefaultArgs,
  Physical: PhysicalDefaultArgs,
  Standard: StandardDefaultArgs,
  Toon: ToonDefaultArgs
}
