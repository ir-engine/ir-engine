import assert from 'assert'
import { STATIC_ASSET_REGEX } from './pathResolver'

describe('STATIC_ASSET_REGEX', () => {
  it('should match static asset URLs', () => {
    const positiveCases = [
      {
        url: 'https://example.com/projects/ir-engine/default-project/assets/images/logo.png',
        orgName: 'ir-engine',
        projectName: 'default-project',
        assetPath: 'assets/images/logo.png'
      },
      {
        url: 'https://example.com/static-resources/ir-engine/default-project/assets/images/logo.png',
        orgName: 'ir-engine',
        projectName: 'default-project',
        assetPath: 'assets/images/logo.png'
      },
      {
        url: 'https://example.com/projects/ir-engine/default-project/assets/animations/emotes.glb',
        orgName: 'ir-engine',
        projectName: 'default-project',
        assetPath: 'assets/animations/emotes.glb'
      },
      {
        url: 'https://example.com/projects/ir-engine/default-project/assets/animations/locomotion.glb',
        orgName: 'ir-engine',
        projectName: 'default-project',
        assetPath: 'assets/animations/locomotion.glb'
      }
    ]
    positiveCases.forEach(({ url, orgName, projectName, assetPath }) => {
      const match = STATIC_ASSET_REGEX.exec(url)
      assert.ok(match, `Expected '${url}' to match STATIC_ASSET_REGEX`)
      assert.equal(match?.[1], orgName, `Expected org name name '${orgName}' in '${url}'. Found ${match?.[1]}`)
      assert.equal(match?.[2], projectName, `Expected project name '${projectName}' in '${url}'. Found ${match?.[2]}`)
      assert.equal(match?.[3], assetPath, `Expected asset path '${assetPath}' in '${url}'. Found ${match?.[3]}`)
    })
  })

  it('should not match non-static asset URLs', () => {
    const negativeCases = [
      'https://example.com/static-resources/',
      'https://example.com/project/subdir/assets',
      'https://example.com/ir-engine/default-project/assets/animations/emotes.glb'
    ]
    negativeCases.forEach((url) => {
      assert.doesNotMatch(url, STATIC_ASSET_REGEX, `Expected '${url}' to not match STATIC_ASSET_REGEX`)
    })
  })
})
