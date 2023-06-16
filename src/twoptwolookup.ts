import fs from 'fs'

let HR: Int32Array

export function lookup(cards: number[]) {

  if (!HR) {
    HR = read_hr()
  }

  let p = HR.readInt32LE((53 + cards[0]) * 4)
  for (let i = 1; i < cards.length; i++) {
    p = HR.readInt32LE((p + cards[i]) * 4)
  }
  return p
}

function read_hr() {
  let buffer = fs.readFileSync('data/HandRanks.dat')

  return buffer
}
