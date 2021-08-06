import { useState } from '@hookstate/core'
import { useContext } from 'react'
import { XRUIStateContext } from '../XRUIStateContext'

export const useXRUIState = <S>() => useState<S>(useContext(XRUIStateContext))
