import { State, useState } from '@hookstate/core'
import { useContext } from 'react'

import { XRUIStateContext } from '../XRUIStateContext'

//@ts-ignore
export const useXRUIState = <S extends State>() => useState<S>(useContext(XRUIStateContext) as S)
