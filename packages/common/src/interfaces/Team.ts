// import { PlayerType } from "../PlayerState/PlayerService"

export interface Team {
  id?: string
  profileId: string
  title?: string
  gp?: number
  w?: number
  l?: number
  win_procent?: number
  min?: number
  pts?: number
  fgm?: number
  fga?: number
  fg_procent?: number
  third_pm?: number
  third_pa?: number
  third_p_procent?: number
  // playersList?: Array<PlayerType>
}
