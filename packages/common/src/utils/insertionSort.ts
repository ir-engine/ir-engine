export function insertionSort<T>(list: T[], comparator: (a: T, b: T) => number): T[] {
  IndexIterator: for (let i = 1; i < list.length; i++) {
    const valueToSort = list[i]

    InsertionIterator: for (let j = i - 1; j >= 0; j--) {
      if (comparator(valueToSort, list[j]) >= 0) {
        list[j + 1] = valueToSort
        continue IndexIterator
      } else {
        list[j + 1] = list[j]
        list[j] = valueToSort
        continue InsertionIterator
      }
    }
  }

  return list
}
