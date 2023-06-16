import fs from 'fs'
import { eval_7hand, eval_5hand_fast } from './cactus'

/* https://github.com/tangentforks/XPokerEval/blob/master/XPokerEval.TwoPlusTwo/generate_table.cpp */ 

function __min(a: number, b: number) {
  return Math.min(a, b)
}

const HandRanks = [`bad`, 'high', 'pair', 'ppair', 'set', 'straight', 'flush', 'full', 'quad', 'sflush']

const IDs: number[] = Array(612978).fill(0)
const HR: number[] = Array(32487834).fill(0)


let numIDs = 1
let numcards = 0
let maxHR = 0
let maxID = 0



function make_id(IDin: number, newcard: number) {
  let ID = 0
  let suitcount = Array(4 + 1).fill(0),
    rankcount = Array(13 + 1).fill(0),
    workcards = Array(8).fill(0),
    cardnum,
  getout = false

  for (let cardnum = 0; cardnum < 6; cardnum++) {
    workcards[cardnum + 1] = ((IDin >> (8 * cardnum)) & 0xff)
  }

  newcard--;

  workcards[0] = (((newcard >> 2) + 1) << 4) + (newcard & 3) + 1

  for (numcards = 0; workcards[numcards]; numcards++) {
    suitcount[workcards[numcards] & 0xf]++;
    rankcount[(workcards[numcards] >> 4) & 0xf]++;
    if (numcards) {
      if (workcards[0] === workcards[numcards]) {
        getout = true
      }
    }
  }

  if (getout) {
    return 0
  }

  let needsuited = numcards - 2

  if (numcards > 4) {
    for (let rank = 1; rank < 14; rank++) {
      if (rankcount[rank] > 4) {
        return 0
      }
    }
  }

  if (needsuited > 1) {
    for (cardnum = 0; cardnum < numcards; cardnum++) {
      if (suitcount[workcards[cardnum] & 0xf] < needsuited) {
        workcards[cardnum] &= 0xf0
      }
    }
  }

  function SWAP(I: number,J: number) {
    if (workcards[I] < workcards[J]) {
      workcards[I]^=workcards[J]; 
      workcards[J]^=workcards[I]; 
      workcards[I]^=workcards[J];
    }
  }

  SWAP(0, 4);		
  SWAP(1, 5);		
  SWAP(2, 6);		
  SWAP(0, 2);		
  SWAP(1, 3);		
  SWAP(4, 6);		
  SWAP(2, 4);		
  SWAP(3, 5);		
  SWAP(0, 1);		
  SWAP(2, 3);		
  SWAP(4, 5);		
  SWAP(1, 4);		
  SWAP(3, 6);		
  SWAP(1, 2);		
  SWAP(3, 4);		
  SWAP(5, 6)

  ID = workcards[0] +
    (workcards[1] << 8) + 
    (workcards[2] << 16) + 
    (workcards[3] << 24) + 
    (workcards[4] << 32) + 
    (workcards[5] << 40) + 
    (workcards[6] << 48)

  return ID
}

function save_id(ID: number) {
  if (ID === 0) return 0

    if (ID >= maxID) {
      if (ID > maxID) {
        IDs[numIDs++] = ID
        maxID = ID
      }
      return numIDs - 1
    }

    let low = 0
    let high = numIDs - 1
    let testval
    let holdtest

    while (high - low > 1) {
      holdtest = Math.floor((high + low + 1) / 2)
      testval = IDs[holdtest] - ID
      if (testval > 0) {
        high = holdtest
      } else if (testval < 0) {
        low = holdtest
      } else return holdtest
    }

  IDs[high] = ID
  numIDs++;
  return high
}

function do_eval(IDin: number) {
  let handrank = 0
  let cardnum = 0
  let workcard = 0
  let rank = 0
  let suit = 0
  let mainsuit = 20
  let suititerator = 1
  let holdrank: number
  let workcards = Array(8).fill(0)
  let holdcards = Array(8).fill(0)
  let numevalcards = 0

  const primes = [ 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41 ];


  if (IDin) {

    for (cardnum = 0; cardnum  < 7; cardnum++) {
      holdcards[cardnum] = Math.floor((IDin >> (8 * cardnum)) & 0xff)
      if (holdcards[cardnum] === 0) { break }
      numevalcards++;
      if (suit = holdcards[cardnum] & 0xf) {
        mainsuit = suit
      }
    }


    for (cardnum = 0; cardnum < numevalcards; cardnum++) {
      workcard = holdcards[cardnum]

      rank = (workcard >> 4) - 1
      suit = workcard & 0xf
      if (suit === 0) {
        suit = suititerator++;
        if (suititerator === 5) {
          suititerator = 1
        }
        if (suit === mainsuit) {
          suit = suititerator++;
          if (suititerator === 5) {
            suititerator = 1
          }
        }
      }
      workcards[cardnum] = primes[rank] | (rank << 8) | (1 << (suit + 11)) | (1 << (16 + rank))
    }

    switch (numevalcards) {
      case 5: {
        holdrank = eval_5hand_fast(workcards[0], workcards[1], workcards[2], workcards[3], workcards[4])
      } break
			case 6: {
				holdrank = eval_5hand_fast(workcards[0],workcards[1],workcards[2],workcards[3],workcards[4]);
				holdrank = __min(holdrank, eval_5hand_fast(workcards[0],workcards[1],workcards[2],workcards[3],workcards[5]));
				holdrank = __min(holdrank, eval_5hand_fast(workcards[0],workcards[1],workcards[2],workcards[4],workcards[5]));
				holdrank = __min(holdrank, eval_5hand_fast(workcards[0],workcards[1],workcards[3],workcards[4],workcards[5]));
				holdrank = __min(holdrank, eval_5hand_fast(workcards[0],workcards[2],workcards[3],workcards[4],workcards[5]));
				holdrank = __min(holdrank, eval_5hand_fast(workcards[1],workcards[2],workcards[3],workcards[4],workcards[5]));
      } break
      case 7: {
        holdrank = eval_7hand(workcards)
      } break
      default: {
        throw `Problem ${numcards}`
      }
    }

    handrank = 7463 - holdrank

    if (handrank < 1278)      { handrank = handrank -    0 + 4096 * 1 } // 1277 high
    else if (handrank < 4138) { handrank = handrank - 1277 + 4096 * 2 } // 2860 pair
    else if (handrank < 4996) { handrank = handrank - 4137 + 4096 * 3 } // 858 ppair
    else if (handrank < 5854) { handrank = handrank - 4995 + 4096 * 4 } // 858 set
    else if (handrank < 5864) { handrank = handrank - 5853 + 4096 * 5 } // 10 straight
    else if (handrank < 7141) { handrank = handrank - 5863 + 4096 * 5 } // 1277 flush
    else if (handrank < 7297) { handrank = handrank - 7140 + 4096 * 6 } // 156 full 
    else if (handrank < 7453) { handrank = handrank - 7296 + 4096 * 8 } // 156 quad
    else                      { handrank = handrank - 7452 + 4096 * 9 } // 10 sflush

  }
  return handrank
}

export function generate_table() {

  let IDslot
  let count = 0
  let ID

  let handTypeSum = Array(10).fill(0)

  let timer = Date.now()
  
  console.log('getting card ids')

  let IDnum
  let holdid

  for (IDnum = 0; IDs[IDnum] || IDnum === 0; IDnum++) {
    for (let card = 1; card < 53; card++) {
      let ID = make_id(IDs[IDnum], card)
      if (numcards < 7) {
        holdid = save_id(ID)
      }
    }
    console.log(`ID - ${IDnum}`)
  }


  console.log('setting hand ranks')


  for (IDnum = 0; IDs[IDnum] || IDnum === 0; IDnum++) {
    for (let card = 1; card < 53; card++) {
      ID = make_id(IDs[IDnum], card)

      if (numcards < 7) {

        IDslot = save_id(ID) * 53 + 53
      } else {
        IDslot = do_eval(ID)
      }
      maxHR = IDnum * 53 + card + 53
      HR[maxHR] = IDslot
    }

    if (numcards === 6 || numcards === 7) {
      HR[IDnum * 53 + 53] = do_eval(IDs[IDnum])
    }
    console.log(`ID - ${IDnum}`)
  }

  console.log(`Number IDs = ${numIDs}`)
  console.log(`maxHR = ${maxHR}`)

  timer = Date.now() - timer

  console.log(`Training seconds = ${timer / 1000}`)

  timer = Date.now()

  let c0, c1, c2, c3, c4, c5, c6
  let u0, u1, u2, u3, u4, u5


  for (c0 = 1; c0 < 53; c0++) {
    u0 = HR[53+c0]
    for (c1 = c0 + 1; c1 < 53; c1++) {
      u1 = HR[u0+c1]
      for (c2 = c1 + 1; c2 < 53; c2++) {
        u2 = HR[u1+c2]
        for (c3 = c2 + 1; c3 < 53; c3++) {
          u3 = HR[u2+c3]
          for (c4 = c3 + 1; c4 < 53; c4++) {
            u4 = HR[u3+c4]
            for (c5 = c4 + 1; c5 < 53; c5++) {
              u5 = HR[u4+c5]
              for (c6 = c5 + 1; c6 < 53; c6++) {
                handTypeSum[HR[u5+c6] >> 12]++;
                count++;
              }
            }
          }
        }
      }
    }
  }

  timer = Date.now() - timer

  for (let i = 0; i <= 9; i++) {
    console.log(`${HandRanks[i]} = ${handTypeSum[i]}`)
  }

  console.log(`Total Hands = ${count}`)

  console.log(`Time ${timer / 1000} seconds`)

  let buffer = Buffer.alloc(HR.length * 4)
  HR.forEach(_ => buffer.writeInt32LE(_))
  fs.writeFileSync('data/HandRanks.dat', buffer)

  console.log('file written.')
}
