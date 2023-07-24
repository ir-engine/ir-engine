/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

export type BinaryHash = string

export class LSHIndex {
  private hashTables: Map<string, BinaryHash[]>[]

  constructor(
    private k: number,
    private l: number
  ) {
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
