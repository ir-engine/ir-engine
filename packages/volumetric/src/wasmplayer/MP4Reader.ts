import { assert } from './utils'
import Bytestream from './Bytestream'
import Track from './Track'

type Box = {
  [key: string]: any
}

const repeatString = (str: string, n: number = 0) =>
  Array(n + 1).join(str)

// const BOX_HEADER_SIZE = 8
// const FULL_BOX_HEADER_SIZE = BOX_HEADER_SIZE + 4

/**
 * Reads an mp4 file and constructs a object graph that corresponds to the box/atom
 * structure of the file. Mp4 files are based on the ISO Base Media format, which in
 * turn is based on the Apple Quicktime format. The Quicktime spec is available at:
 * http://developer.apple.com/library/mac/#documentation/QuickTime/QTFF. An mp4 spec
 * also exists, but I cannot find it freely available.
 *
 * Mp4 files contain a tree of boxes (or atoms in Quicktime). The general structure
 * is as follows (in a pseudo regex syntax):
 *
 * Box / Atom Structure:
 *
 * [size type [version flags] field* box*]
 *  <32> <4C>  <--8--> <24->  <-?->  <?>
 *  <------------- box size ------------>
 *
 *  The box size indicates the entire size of the box and its children, we can use it
 *  to skip over boxes that are of no interest. Each box has a type indicated by a
 *  four character code (4C), this describes how the box should be parsed and is also
 *  used as an object key name in the resulting box tree. For example, the expression:
 *  "moov.trak[0].mdia.minf" can be used to access individual boxes in the tree based
 *  on their 4C name. If two or more boxes with the same 4C name exist in a box, then
 *  an array is built with that name.
 *
 */
export default class MP4Reader {
  public stream: Bytestream
  public tracks: Track[]
  private file: any

  constructor(stream: Bytestream) {
    this.stream = stream
    this.tracks = []
  }

  readBoxes(stream: Bytestream, parent: any, currentDepth: number = 0) {
    while (stream.peek32()) {
      const child = this.readBox(stream, currentDepth)

      if (child.type in parent) {
        const old = parent[child.type]

        if (!(old instanceof Array))
          parent[child.type] = [old]

        parent[child.type].push(child)
      }
      else
        parent[child.type] = child
    }
  }

  readBox(stream: Bytestream, currentDepth: number): Box {
    const box: Box = {
      offset: stream.position
    }

    function readHeader() {
      box.size = stream.readU32()
      box.type = stream.read4CC()
    }

    function readFullHeader() {
      box.version = stream.readU8()
      box.flags = stream.readU24()
    }

    function remainingBytes() {
      return box.size - (stream.position - box.offset)
    }

    function skipRemainingBytes() {
      stream.skip(remainingBytes())
    }

    const readRemainingBoxes = (currentDepth: number) => {
      var subStream = stream.subStream(stream.position, remainingBytes())
      this.readBoxes(subStream, box, currentDepth + 1)
      stream.skip(subStream.length)
    }

    readHeader()

    console.log(`${repeatString(' ', currentDepth)}- ${box.type}`)

    switch (box.type) {
      case 'ftyp':
        box.name = 'File Type Box'
        box.majorBrand = stream.read4CC()
        box.minorVersion = stream.readU32()
        box.compatibleBrands = new Array((box.size - 16) / 4)

        for (let i = 0; i < box.compatibleBrands.length; i++)
          box.compatibleBrands[i] = stream.read4CC()
        break

      case 'moov':
        box.name = 'Movie Box'
        readRemainingBoxes(currentDepth)
        break

      case 'mvhd':
        box.name = 'Movie Header Box'
        readFullHeader()
        assert(box.version == 0)
        box.creationTime = stream.readU32()
        box.modificationTime = stream.readU32()
        box.timeScale = stream.readU32()
        box.duration = stream.readU32()
        box.rate = stream.readFP16()
        box.volume = stream.readFP8()
        stream.skip(10)
        box.matrix = stream.readU32Array(9)
        stream.skip(6 * 4)
        box.nextTrackId = stream.readU32()
        break

      case 'trak':
        box.name = 'Track Box'
        readRemainingBoxes(currentDepth)
        this.tracks[box.tkhd.trackId] = new Track(this, box)
        break

      case 'tkhd':
        box.name = 'Track Header Box'
        readFullHeader()
        assert(box.version == 0)
        box.creationTime = stream.readU32()
        box.modificationTime = stream.readU32()
        box.trackId = stream.readU32()
        stream.skip(4)
        box.duration = stream.readU32()
        stream.skip(8)
        box.layer = stream.readU16()
        box.alternateGroup = stream.readU16()
        box.volume = stream.readFP8()
        stream.skip(2)
        box.matrix = stream.readU32Array(9)
        box.width = stream.readFP16()
        box.height = stream.readFP16()
        break

      case 'mdia':
        box.name = 'Media Box'
        readRemainingBoxes(currentDepth)
        break

      case 'mdhd':
        box.name = 'Media Header Box'
        readFullHeader()
        assert(box.version == 0)
        box.creationTime = stream.readU32()
        box.modificationTime = stream.readU32()
        box.timeScale = stream.readU32()
        box.duration = stream.readU32()
        box.language = stream.readISO639()
        stream.skip(2)
        break

      case 'hdlr':
        box.name = 'Handler Reference Box'
        readFullHeader()
        stream.skip(4)
        box.handlerType = stream.read4CC()
        stream.skip(4 * 3)
        let bytesLeft = box.size - 32
        if (bytesLeft > 0)
          box.name = stream.readUTF8(bytesLeft)
        break

      case 'minf':
        box.name = 'Media Information Box'
        readRemainingBoxes(currentDepth)
        break

      case 'stbl':
        box.name = 'Sample Table Box'
        readRemainingBoxes(currentDepth)
        break

      case 'stsd':
        box.name = 'Sample Description Box'
        readFullHeader()
        box.sd = []
        stream.readU32()
        readRemainingBoxes(currentDepth)
        break

      case 'avc1':
        stream.reserved(6, 0)
        box.dataReferenceIndex = stream.readU16()
        assert(stream.readU16() == 0) // Version
        assert(stream.readU16() == 0) // Revision Level
        stream.readU32() // Vendor
        stream.readU32() // Temporal Quality
        stream.readU32() // Spatial Quality
        box.width = stream.readU16()
        box.height = stream.readU16()
        box.horizontalResolution = stream.readFP16()
        box.verticalResolution = stream.readFP16()
        assert(stream.readU32() == 0) // Reserved
        box.frameCount = stream.readU16()
        box.compressorName = stream.readPString(32)
        box.depth = stream.readU16()
        assert(stream.readU16() == 0xFFFF) // Color Table Id
        readRemainingBoxes(currentDepth)
        break

      case 'mp4a':
        stream.reserved(6, 0)
        box.dataReferenceIndex = stream.readU16()
        box.version = stream.readU16()
        stream.skip(2)
        stream.skip(4)
        box.channelCount = stream.readU16()
        box.sampleSize = stream.readU16()
        box.compressionId = stream.readU16()
        box.packetSize = stream.readU16()
        box.sampleRate = stream.readU32() >>> 16

        // TODO: Parse other version levels.
        assert(box.version == 0)
        readRemainingBoxes(currentDepth)
        break

      case 'esds':
        box.name = 'Elementary Stream Descriptor'
        readFullHeader()
        // TODO: Do we really need to parse this?
        skipRemainingBytes()
        break

      case 'avcC':
        box.name = 'AVC Configuration Box'
        box.configurationVersion = stream.readU8()
        box.avcProfileIndication = stream.readU8()
        box.profileCompatibility = stream.readU8()
        box.avcLevelIndication = stream.readU8()
        box.lengthSizeMinusOne = stream.readU8() & 3
        assert(box.lengthSizeMinusOne == 3, 'TODO')

        const count1 = stream.readU8() & 31
        box.sps = []
        for (let i = 0; i < count1; i++)
          box.sps.push(stream.readU8Array(stream.readU16()))

        const count2 = stream.readU8() & 31
        box.pps = []
        for (let i = 0; i < count2; i++)
          box.pps.push(stream.readU8Array(stream.readU16()))

        skipRemainingBytes()
        break

      case 'btrt':
        box.name = 'Bit Rate Box'
        box.bufferSizeDb = stream.readU32()
        box.maxBitrate = stream.readU32()
        box.avgBitrate = stream.readU32()
        break

      case 'stts':
        box.name = 'Decoding Time to Sample Box'
        readFullHeader()
        box.table = stream.readU32Array(stream.readU32(), 2, ["count", "delta"])
        break

      case 'stss':
        box.name = 'Sync Sample Box'
        readFullHeader()
        box.samples = stream.readU32Array(stream.readU32())
        break

      case 'stsc':
        box.name = 'Sample to Chunk Box'
        readFullHeader()
        box.table = stream.readU32Array(stream.readU32(), 3, [
          'firstChunk',
          'samplesPerChunk',
          'sampleDescriptionId'
        ])
        break

      case 'stsz':
        box.name = 'Sample Size Box'
        readFullHeader()
        box.sampleSize = stream.readU32()
        const count = stream.readU32()
        if (box.sampleSize == 0)
          box.table = stream.readU32Array(count)
        break

      case 'stco':
        box.name = 'Chunk Offset Box'
        readFullHeader()
        box.table = stream.readU32Array(stream.readU32())
        break

      case 'smhd':
        box.name = 'Sound Media Header Box'
        readFullHeader()
        box.balance = stream.readFP8()
        stream.reserved(2, 0)
        break

      case 'mdat':
        box.name = 'Media Data Box'
        assert(box.size >= 8, "Cannot parse large media data yet.")
        box.data = stream.readU8Array(remainingBytes())
        break

      default:
        skipRemainingBytes()
        break
    }
    return box
  }

  read() {
    var start = (new Date).getTime()
    this.file = {}
    this.readBoxes(this.stream, this.file)
    console.info(`Parsed stream in ${(new Date).getTime() - start} ms`)
  }

  traceSamples() {
    const video = this.tracks[1]
    const audio = this.tracks[2]

    console.info(`Video Samples: ${video.getSampleCount()}`)
    console.info(`Audio Samples: ${audio.getSampleCount()}`)

    let vi = 0
    let ai = 0

    for (let i = 0; i < 100; i++) {
      const vo = video.sampleToOffset(vi)
      const ao = audio.sampleToOffset(ai)

      const vs = video.sampleToSize(vi, 1)
      const as = audio.sampleToSize(ai, 1)

      if (vo < ao) {
        console.info(`V Sample ${vi} Offset : ${vo}, Size : ${vs}`)
        vi++
      }
      else {
        console.info(`A Sample ${ai} Offset : ${ao} Size : ${as}`)
        ai++
      }
    }
  }
}
