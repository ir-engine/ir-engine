export type BinaryHash = string

export class LSHIndex {
  private hashTables: Map<string, BinaryHash[]>[]

  constructor(private k: number, private l: number) {
    this.hashTables = new Array(l).fill(null).map(() => new Map())
  }

  private generateHashes(binaryHash: BinaryHash): string[] {
    const hashes: string[] = []
    for (let i = 0; i < this.l; i++) {
      const start = Math.floor((i * binaryHash.length) / this.l)
      const hash = binaryHash.slice(start, start + this.k)
      hashes.push(hash)
    }
    return hashes
  }

  private hammingDistance(binaryHash1: BinaryHash, binaryHash2: BinaryHash): number {
    let distance = 0
    for (let i = 0; i < binaryHash1.length; i++) {
      if (binaryHash1[i] !== binaryHash2[i]) {
        distance++
      }
    }
    return distance
  }

  add(binaryHash: BinaryHash, id: string): void {
    const hashes = this.generateHashes(binaryHash)
    hashes.forEach((hash, index) => {
      const table = this.hashTables[index]
      if (!table.has(hash)) {
        table.set(hash, [])
      }
      table.get(hash)!.push(id)
    })
  }

  query(binaryHash: BinaryHash, threshold: number): string[] {
    const hashes = this.generateHashes(binaryHash)
    const resultSet = new Set<string>()

    hashes.forEach((hash, index) => {
      const table = this.hashTables[index]
      if (table.has(hash)) {
        const ids = table.get(hash)!
        ids.forEach((id) => resultSet.add(id))
      }
    })

    // Filter the results based on the threshold
    const filteredResults = Array.from(resultSet).filter((id) => {
      const candidateHash = this.generateHashes(binaryHash).join('')
      const distance = this.hammingDistance(binaryHash, candidateHash)
      return distance <= threshold
    })

    return filteredResults
  }
}
