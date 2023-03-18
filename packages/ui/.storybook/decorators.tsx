import React from 'react'

import ThemesProvider from '../../client/src/ThemesProvider/themesProvider'

export const withThemesProvider = (storyFn) => <ThemesProvider>{storyFn()}</ThemesProvider>
