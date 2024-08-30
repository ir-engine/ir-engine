import assert from 'assert'
import { CSS_URL_REGEX } from './generateEmbeddedCSS'

describe('CSS_URL_REGEX', () => {
  it('should match for CSS sources with valid URLs', () => {
    const positiveCases = [
      {
        source: '@import url("https://example.com/styles.css");',
        urlResource: 'https://example.com/styles.css'
      },
      {
        source: 'background: url("https://example.com/image.jpg");',
        urlResource: 'https://example.com/image.jpg'
      },
      {
        source: "background: url('https://example.com/image.jpg');",
        urlResource: 'https://example.com/image.jpg'
      },
      {
        source: 'background: url(https://example.com/image.jpg);',
        urlResource: 'https://example.com/image.jpg'
      }
    ]

    positiveCases.forEach(({ source, urlResource }) => {
      const matches = source.matchAll(CSS_URL_REGEX)

      const matchesArray = Array.from(matches)
      assert.ok(matchesArray.length > 0, `Expected '${source}' to match CSS_URL_REGEX`)

      for (const match of matchesArray) {
        assert.equal(
          match[2] ?? match[3],
          urlResource,
          `Expected URL resource: ${urlResource} in '${source}'. Found ${match[2] ?? match[3]}`
        )
      }
    })
  })

  it('should not match invalid CSS imports & URLs', () => {
    const negativeCases = [
      'color: #fff;',
      'background: urll(https://example.com/image.jpg);', // Misspelled 'url'
      'url(https://example.com/image', // Missing closing parenthesis
      'background: url();' // Empty URL
    ]

    negativeCases.forEach((source) => {
      const matches = source.matchAll(CSS_URL_REGEX)
      const matchesArray = Array.from(matches)
      assert.ok(matchesArray.length === 0, `Expected '${source}' to not match CSS_URL_REGEX`)
    })
  })
})
