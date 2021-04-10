import { assert } from './utils'
import Bytestream from './Bytestream'

const PARANOID = true

export default class Track {
  private file: any
  public trak: any

  constructor(file: any, trak: any) {
    this.file = file
    this.trak = trak
  }

  getSampleSizeTable() {
    return this.trak.mdia.minf.stbl.stsz.table
  }

  getSampleCount() {
    return this.getSampleSizeTable().length
  }

  /**
   * Computes the size of a range of samples, returns zero if length is zero.
   */
  sampleToSize(start: number, length: number) {
    const table = this.getSampleSizeTable()
    let size = 0

    for (let i = start; i < start + length; i++)
      size += table[i]

    return size
  }

  /**
   * Computes the chunk that contains the specified sample, as well as the offset of
   * the sample in the computed chunk.
   */
  sampleToChunk(sample: any) {

    /* Samples are grouped in chunks which may contain a variable number of samples.
     * The sample-to-chunk table in the stsc box describes how samples are arranged
     * in chunks. Each table row corresponds to a set of consecutive chunks with the
     * same number of samples and description ids. For example, the following table:
     *
     * +-------------+-------------------+----------------------+
     * | firstChunk  |  samplesPerChunk  |  sampleDescriptionId |
     * +-------------+-------------------+----------------------+
     * | 1           |  3                |  23                  |
     * | 3           |  1                |  23                  |
     * | 5           |  1                |  24                  |
     * +-------------+-------------------+----------------------+
     *
     * describes 5 chunks with a total of (2 * 3) + (2 * 1) + (1 * 1) = 9 samples,
     * each chunk containing samples 3, 3, 1, 1, 1 in chunk order, or
     * chunks 1, 1, 1, 2, 2, 2, 3, 4, 5 in sample order.
     *
     * This function determines the chunk that contains a specified sample by iterating
     * over every entry in the table. It also returns the position of the sample in the
     * chunk which can be used to compute the sample's exact position in the file.
     *
     * TODO: Determine if we should memoize this function.
     */

    var table = this.trak.mdia.minf.stbl.stsc.table

    if (table.length === 1) {
      const row = table[0]
      assert(row.firstChunk === 1)

      return {
        index: Math.floor(sample / row.samplesPerChunk),
        offset: sample % row.samplesPerChunk
      }
    }

    var totalChunkCount = 0
    for (let i = 0; i < table.length; i++) {
      const row = table[i]

      if (i > 0) {
        var previousRow = table[i - 1]
        var previousChunkCount = row.firstChunk - previousRow.firstChunk
        var previousSampleCount = previousRow.samplesPerChunk * previousChunkCount

        if (sample >= previousSampleCount) {
          sample -= previousSampleCount

          if (i == table.length - 1)
            return {
              index: totalChunkCount + previousChunkCount + Math.floor(sample / row.samplesPerChunk),
              offset: sample % row.samplesPerChunk
            }
        }
        else
          return {
            index: totalChunkCount + Math.floor(sample / previousRow.samplesPerChunk),
            offset: sample % previousRow.samplesPerChunk
          }

        totalChunkCount += previousChunkCount
      }
    }
    assert(false)
  }

  chunkToOffset(chunk: number) {
    var table = this.trak.mdia.minf.stbl.stco.table
    return table[chunk]
  }

  sampleToOffset(sample: any) {
    var res = this.sampleToChunk(sample)
    var offset = this.chunkToOffset(res.index)
    return offset + this.sampleToSize(sample - res.offset, res.offset)
  }

  /**
   * Computes the sample at the specified time.
   */
  timeToSample(time: number) {
    /* In the time-to-sample table samples are grouped by their duration. The count field
     * indicates the number of consecutive samples that have the same duration. For example,
     * the following table:
     *
     * +-------+-------+
     * | count | delta |
     * +-------+-------+
     * |   4   |   3   |
     * |   2   |   1   |
     * |   3   |   2   |
     * +-------+-------+
     *
     * describes 9 samples with a total time of (4 * 3) + (2 * 1) + (3 * 2) = 20.
     *
     * This function determines the sample at the specified time by iterating over every
     * entry in the table.
     *
     * TODO: Determine if we should memoize this function.
     */
    const table = this.trak.mdia.minf.stbl.stts.table
    let sample = 0

    for (let i = 0; i < table.length; i++) {
      const delta = table[i].count * table[i].delta

      if (time >= delta) {
        time -= delta
        sample += table[i].count
      }
      else
        return sample + Math.floor(time / table[i].delta)
    }
  }

  /**
   * Gets the total time of the track.
   */
  getTotalTime() {
    if (PARANOID) {
      const table = this.trak.mdia.minf.stbl.stts.table
      let duration = 0

      for (let i = 0; i < table.length; i++)
        duration += table[i].count * table[i].delta

      assert(this.trak.mdia.mdhd.duration == duration)
    }
    return this.trak.mdia.mdhd.duration
  }

  getTotalTimeInSeconds() {
    return this.timeToSeconds(this.getTotalTime())
  }

  getTimeScale() {
    return this.trak.mdia.mdhd.timeScale
  }

  /**
   * Converts time units to real time (seconds).
   */
  timeToSeconds(time: number) {
    return time / this.getTimeScale()
  }

  /**
   * Converts real time (seconds) to time units.
   */
  secondsToTime(seconds: number) {
    return seconds * this.getTimeScale()
  }

  foo() {
    /*
    for (var i = 0; i < this.getSampleCount(); i++) {
      var res = this.sampleToChunk(i)
      console.info("Sample " + i + " -> " + res.index + " % " + res.offset +
                   " @ " + this.chunkToOffset(res.index) +
                   " @@ " + this.sampleToOffset(i))
    }
    console.info("Total Time: " + this.timeToSeconds(this.getTotalTime()))
    var total = this.getTotalTimeInSeconds()
    for (var i = 50; i < total; i += 0.1) {
      // console.info("Time: " + i.toFixed(2) + " " + this.secondsToTime(i))

      console.info("Time: " + i.toFixed(2) + " " + this.timeToSample(this.secondsToTime(i)))
    }
    */
  }

  /**
   * AVC samples contain one or more NAL units each of which have a length prefix.
   * This function returns an array of NAL units without their length prefixes.
   */
  getSampleNALUnits(sample: number): Uint8Array[] {
    const nalUnits: Uint8Array[] = []
    const bytes = this.file.stream.bytes
    let offset = this.sampleToOffset(sample)
    const end = offset + this.sampleToSize(sample, 1)

    while (end - offset > 0) {
      const length = (new Bytestream(bytes.buffer, offset)).readU32()
      nalUnits.push(bytes.subarray(offset + 4, offset + length + 4))
      offset = offset + length + 4
    }
    return nalUnits
  }
}
