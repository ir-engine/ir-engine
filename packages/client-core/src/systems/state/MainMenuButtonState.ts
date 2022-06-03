import { createState, useState } from '@speigg/hookstate'

export const MainMenuButtonState = createState({
  chatMenuOpen: false,
  emoteMenuOpen: false,
  settingMenuOpen: false,
  shareMenuOpen: true
})
export const accessMainMenuButtonState = () => MainMenuButtonState
export const useMainMenuButtonState = () =>
  useState(MainMenuButtonState) as any as typeof MainMenuButtonState as typeof MainMenuButtonState
