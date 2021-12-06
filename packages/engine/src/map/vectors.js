import { VectorTile } from '@mapbox/vector-tile'
import Protobuf from 'pbf'
import buffer from 'buffer'
import { buffer as tb } from '@turf/turf'

// TODO reorganize

function turf_buffer(geojson, radius, opts) {
  return tb(geojson, radius, opts)
}

export function vectors(blob, cb) {
  /*fetch("http://stage.countable.ca:8080/data/v3/2/1/1.pbf").then(function(response) {
        var b = response.blob();
        return b;
    }).then(function(data) {*/
  //var geojson = geobuf.decode(new Pbf(data));
  blobToBuffer(blob, function (err, buf) {
    if (err) throw err

    var tile = new VectorTile(new Protobuf(buf))
    cb(tile)
  })
}

export default {
  turf_buffer: turf_buffer,
  vectors: vectors
}

function blobToBuffer(blob, cb) {
  if (typeof Blob === 'undefined' || !(blob instanceof Blob)) {
    throw new Error('first argument must be a Blob')
  }
  if (typeof cb !== 'function') {
    throw new Error('second argument must be a function')
  }

  var reader = new FileReader()

  function onLoadEnd(e) {
    reader.removeEventListener('loadend', onLoadEnd, false)
    if (e.error) cb(e.error)
    else cb(null, buffer.Buffer.from(reader.result))
  }

  reader.addEventListener('loadend', onLoadEnd, false)
  reader.readAsArrayBuffer(blob)
}
