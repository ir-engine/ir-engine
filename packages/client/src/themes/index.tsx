import basicTheme from './basic'
import cupcakeTheme from './themes/cupcake'
import darkTheme from './themes/darkTheme'
import defaultTheme from './themes/defaultTheme'
import luxuryTheme from './themes/luxury'

const combineConfigs = (config1, config2) => ({
  ...config1,
  ...config2,
  theme: {
    ...config1.theme,
    ...config2.theme,
    extend: {
      ...config1.theme.extend,
      ...config2.theme.extend
    },
    colors: {
      ...config1.theme.colors,
      ...config2.theme.colors
    }
  }
})

export default {
  default: combineConfigs(basicTheme, defaultTheme),
  dark: combineConfigs(basicTheme, darkTheme),
  luxury: combineConfigs(basicTheme, luxuryTheme),
  cupcake: combineConfigs(basicTheme, cupcakeTheme)
}
