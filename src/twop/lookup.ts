import fs from 'fs'
import { execSync } from 'child_process'

let HR: Buffer

export function lookup(cards: number[]) {

  if (!HR) {
    HR = read_hr()
  }

  let p = HR.readInt32LE((53 + cards[0]) * 4)
  for (let i = 1; i < cards.length; i++) {
    p = HR.readInt32LE((p + cards[i]) * 4)
  }

  if (cards.length === 5 || cards.length === 6) {
    return HR.readInt32LE(p * 4)
  }

  return p
}

function read_hr() {

  let buffer = fs.readFileSync(__dirname + 'data/HandRanks.dat')

  return buffer
}
