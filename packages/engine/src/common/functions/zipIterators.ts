import { some } from 'lodash'
export default function* zipIterators<ZipItem extends any[]>(...iters: Iterator<any>[]): Generator<ZipItem> {
  while (true) {
    const results = iters.map((iter) => iter.next())
    const values = results.map((result) => result.value)
    const done = some(results.map((result) => result.done))
    if (done) {
      break
    } else {
      yield values as ZipItem
    }
  }
}
