import fs from 'fs'

function encode5(cards) {
  return cards[0] +
    (cards[1] << 4) + 
    (cards[2] << 8) +
    (cards[3] << 12) + 
    (cards[4] << 16)
}

function pair_kicker_map() {
  let res = []
  for (let c1 = 1; c1 <= 13; c1++) {
    for (let c2 = 1; c2 <= 13; c2++) {
      for (let c3 = 1; c3 <= 13; c3++) {
        for (let c4 = 1; c4 <= 13; c4++) {
          if (c1 === c2 || c1 === c3 || c1 === c4) { continue }
          if (c4 >= c3 || c3 >= c2) { continue }
          res.push(encode5([c1, c2, c3, c4]))
        }
      }
    }
  }

  if (res.length !== 2860) {
    throw `Invalid pair kickers ${res.length}`
  }
  return res
}

function ppair_kicker_map() {
  let res = []
  for (let c1 = 1; c1 <= 13; c1++) {
    for (let c2 = 1; c2 <= 13; c2++) {
      for (let c3 = 1; c3 <= 13; c3++) {
        if (c1 <= c2 || c1 === c3 || c2 === c3) { continue }
        res.push(encode5([c1, c2, c3]))
      }
    }
  }

  if (res.length !== 858) {
    throw `Invalid ppair kickers ${res.length}`
  }
  return res
}

function set_kicker_map() {

  let res = []
  for (let c1 = 1; c1 <= 13; c1++) {
    for (let c2 = 1; c2 <= 13; c2++) {
      for (let c3 = 1; c3 <= 13; c3++) {
        if (c1 === c2 || c1 === c3 || c2 <= c3) { continue }
        res.push(encode5([c1, c2, c3]))
      }
    }
  }

  if (res.length !== 858) {
    throw `Invalid set kickers ${res.length}`
  }
  return res
}

function flush_kicker_map() {
  let res = []
  for (let c1 = 6; c1 <= 13; c1++) {
    for (let c2 = 4; c2 <= 12; c2++) {
      for (let c3 = 3; c3 <= 11; c3++) {
        for (let c4 = 2; c4 <= 10; c4++) {
          for (let c5 = 1; c5 <= 9; c5++) {
            if (c1 === 13 &&
              c2 === 4 &&
              c3 === 3 &&
              c4 === 2 &&
              c5 === 1) { continue }
            if (c1 <= c2 || c2 <= c3 || c3 <= c4 || c4 <= c5) { continue }
            if (c1 - c2 === 1 &&
              c2 - c3 === 1 &&
              c3 - c4 === 1 &&
              c4 - c5 === 1) { continue; }
            res.push(encode5([c1, c2, c3, c4, c5]))
          }
        }
      }
    }
  }
  
  if (res.length !== 1277) {
    throw `Invalid flush kickers ${res.length}`
  }
  return res
}

function gen_maps() {

  let flush_kickers = flush_kicker_map()
  let set_kickers = set_kicker_map()
  let ppair_kickers = ppair_kicker_map()
  let pair_kickers = pair_kicker_map()

  let res = { 
    flush_kickers, 
    set_kickers,
    ppair_kickers,
    pair_kickers
  }

  fs.writeFileSync('flush_kickers.json', JSON.stringify(res))
  console.log('done')
}


gen_maps()
