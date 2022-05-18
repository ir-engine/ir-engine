import { GameServerSetting } from './GameServerSetting'

export interface GameServerSettingResult {
  data: GameServerSetting[]
  total: number
  limit: number
  skip: number
}
