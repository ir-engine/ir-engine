import { createState, useState } from '@speigg/hookstate'

export const MainMenuButtonState = createState({
  showButtons: false,
  chatMenuOpen: true,
  emoteMenuOpen: false,
  settingMenuOpen: false,
  shareMenuOpen: false
})
export const accessMainMenuButtonState = () => MainMenuButtonState
export const useMainMenuButtonState = () =>
  useState(MainMenuButtonState) as any as typeof MainMenuButtonState as typeof MainMenuButtonState
