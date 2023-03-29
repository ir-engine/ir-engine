export default {
  theme: {
    extend: {
      scale: {
        '-100': '-1',
      },
      rotate: {
        '180': '180deg',
      },
      animation: {
        fadeIn: 'fadeIn 0.15s ease-in-out 1',
        fadeOut: 'fadeOut 0.15s ease-in-out 1',
      },
      keyframes: () => ({
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        fadeOut: {
          '100%': { opacity: 1 },
          '0%': { opacity: 0 },
        },
      }),
      transitionProperty: {
        height: 'height',
        opacity: 'opacity',
      },
      opacity: {
        '50': '.50',
      },
      backgroundSize: {
        'auto': 'auto',
        'cover': 'cover',
        'contain': 'contain',
        '50%': '50%',
        '75%': '75%',
        '80%': '80%',
      },
      borderWidth: {
        DEFAULT: '1px',
        '0': '0',
        '2': '2px',
        '3': '3px',
        '4': '4px',
        '6': '6px',
        '8': '8px',
      }
    }
  }
}