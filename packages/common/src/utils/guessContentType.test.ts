import assert from "assert"
import { guessContentType } from './guessContentType'

describe('guessContentType', () => {
  it('guessContentType', () => {
    assert(guessContentType('https://mydomain.com/myfile.gltf'), 'model/gltf')
    assert(guessContentType('https://mydomain.com/myfile.glb'), 'model/gltf-binary')
    assert(guessContentType('https://mydomain.com/myfile.png'), 'image/png')
    assert(guessContentType('https://mydomain.com/myfile.jpg'), 'image/jpeg')
    assert(guessContentType('https://mydomain.com/myfile.jpeg'), 'image/jpeg')
    assert(guessContentType('https://mydomain.com/myfile.pdf'), 'application/pdf')
    assert(guessContentType('https://mydomain.com/myfile.mp4'), 'video/mp4')
    assert(guessContentType('https://mydomain.com/myfile.mp3'), 'audio/mpeg')
    assert(guessContentType('https://mydomain.com/myfile.tsx'), 'application/octet-stream')
    assert(guessContentType('https://mydomain.com/myfile.ts'), 'application/octet-stream')
    assert(guessContentType('https://mydomain.com/myfile.js'), 'application/octet-stream')
  })
})