import { useState } from '@speigg/hookstate'
import { useContext } from 'react'
import { XRUIStateContext } from '../XRUIStateContext'
//@ts-ignore
export const useXRUIState = <S>() => useState<S>(useContext(XRUIStateContext))
