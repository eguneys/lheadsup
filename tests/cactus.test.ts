import { it, expect } from 'vitest'
import { shuffle, cards } from '../src'
import { encode_card, eval5_cards, eval_7hand } from '../src'

import { lookup, hand_rank_cactus } from '../src'
import { eval_ranks, lookup_cards_str } from '../src'

it.skip('find kickers', () => {

  let quads = [
    [`AdAhAcAs2d2c2s`, `quads A`],
    [`AdAhAcAs2d2c3s`, `quads A`],
    [`AdAhAcAsKdKcKs`, `quads A`],
    [`KdKhKcKs5d2c8s`, `quads K`],
    [`QdQhQcQs5d2c8s`, `quads Q`],
    [`3d3h3c3s5d4c8s`, `quads 3`],
    [`2d2h2c2s5d3c8s`, `quads 2`],
  ]

  let straights = [
    [`AcKdQsJhThQc2d`, 'straight A'],
    [`KcQdJsTh9hQc2d`, 'straight K'],
    [`5c6d7s8h9hQc2d`, 'straight 9'],
    [`6c2d3s4h5hQc2d`, 'straight 6'],
    [`Ac2d3s4h5hQc2d`, 'straight 5']
  ]

  let quads_r = quads.map(qs => lookup_cards_str(qs[0]))
  let straights_r = straights.map(qs => lookup_cards_str(qs[0]))
  console.log(quads_r, straights_r)
})

it('batch lookup cards', () => {
  let batch = [
    [`QdQhQcQs5d2c8s`, `quads Q`],
    [`KcKhKsJdJc6h7s`, `full KJ`],
    [`7c7s7hKdJh8s3d`, `set 7KJ`],
    [`QhQd8s8d6c4s2h`, `ppair Q86`],
    [`8h9hThJhQh7d2c`, `sflush Q`],
    [`KcKh2s9h3d6c7d`, `pair K976`],
    [`5c6d7s8h9hQc2d`, 'straight 9'],
    [`Ah2h5h8hKh7sJc`, 'flush AK852'],
    [`Ah2d3c4s5h8cQd`, 'straight 5'],
    [`TcJhQdKsAh4c7d`, 'straight A'],
  ]

  batch.forEach(([cs, e]) => {
    let r = lookup_cards_str(cs)
    expect(eval_ranks[r >> 12]).toBe(e.split(' ')[0])
  })
})

it('lookup cards', () => {
  let r = lookup_cards_str('2h3h4h5h6h')
  expect(eval_ranks[r >> 12]).toBe('sflush')


  r = lookup_cards_str('2h7h4h5h6h')
  expect(eval_ranks[r >> 12]).toBe('flush')

  r = lookup_cards_str('2h7c4h5c6h')
  expect(eval_ranks[r >> 12]).toBe('high')
})

it('five six hands', () => {
  let r = lookup([2, 6, 12, 14, 23])
  expect(r >> 12).toBe(1)

  r = lookup([2, 6, 12, 14, 23, 26])
  expect(r >> 12).toBe(1)
})

it.skip('freqs', () => {

  let handTypeSum = Array(10).fill(0)
 
  let count = 0
  let c0, c1, c2, c3, c4, c5, c6

  for (c0 = 1; c0 < 53; c0++) {
    for (c1 = c0+1; c1 < 53; c1++) {
      for (c2 = c1+1; c2 < 53; c2++) {
        for (c3 = c2+1; c3 < 53; c3++) {
          for (c4 = c3+1; c4 < 53; c4++) {
            for (c5 = c4+1; c5 < 53; c5++) {
              for (c6 = c5+1; c6 < 53; c6++) {
                handTypeSum[lookup([c0, c1, c2, c3, c4, c5, c6]) >> 12]++;
                count++;
              }
            }
          }
        }
      }
    }
  }

  expect(handTypeSum[0]).toBe(0)
  expect(handTypeSum[1]).toBe(23294460) // high
  expect(handTypeSum[2]).toBe(58627800) // pair
  expect(handTypeSum[3]).toBe(31433400) // ppair
  expect(handTypeSum[4]).toBe(6461620) // set
  expect(handTypeSum[5]).toBe(6180020) // straight
  expect(handTypeSum[6]).toBe(4047644) // flush
  expect(handTypeSum[7]).toBe(3473184) // full
  expect(handTypeSum[8]).toBe(224848) // quads
  expect(handTypeSum[9]).toBe(41584) // sflush
  expect(count).toBe(133784560) // total

  let t = 0
  for (let i = 0; i < 10; i++) {
    t += handTypeSum[i]
  }
  expect(handTypeSum.length).toBe(10)
  expect(t).toBe(count)
  expect(count).toBe(133784560)
  expect(handTypeSum[0]).toBe(0)
})

it('fast look', () => {
  let r = lookup([2, 6, 12, 14, 23, 26, 29])
  expect(r).toBe(4145)
  expect(r >> 12).toBe(1)

  r = lookup([1, 2, 3, 4, 5, 6, 7])
  expect(r).toBe(32769)
  expect(r >> 12).toBe(8)


})

it('encodes', () => {
  expect(encode_card('Kd')).toBe(0b00001000000000000100101100100101)
  expect(encode_card('5s')).toBe(0b00000000000010000001001100000111)
  expect(encode_card('Jc')).toBe(0b00000010000000001000100100011101)
})

it('flush', () => {
  let a = ['Ah', 'Kh', 'Qh', 'Jh', '9h']
  expect(eval5_cards(a)).toBe(323)

  expect(eval5_cards(['Kh', 'Qh', 'Th', '7h', '6h'])).toBe(864)
})

it('quads', () => {
  let eleven = ['As', 'Ah', 'Ad', 'Ac', 'Kh']
  expect(eval5_cards(shuffle(eleven))).toBe(11)
})

it('ranks', () => {
  let ones = [
    ['Tc', 'Jc', 'Qc', 'Kc', 'Ac'],
    ['Ts', 'Js', 'Qs', 'Ks', 'As'],
    ['Td', 'Jd', 'Qd', 'Kd', 'Ad'],
    ['Th', 'Jh', 'Qh', 'Kh', 'Ah'],
  ]
  ones.forEach(one => {
    let i = eval5_cards(one)
    expect(i).toBe(1)
    expect(hand_rank_cactus(i)).toBe(1)
  })

  ones.forEach(one => {
    expect(eval5_cards(shuffle(one))).toBe(1)
  })


  let two = ['9h', 'Th', 'Jh', 'Qh', 'Kh']
  expect(eval5_cards(shuffle(two))).toBe(2)

  let ten = ['Ah', '2h', '3h', '4h', '5h']
  expect(eval5_cards(shuffle(ten))).toBe(10)
})


/*
it('cactus eval 7', () => {
  let expected_freq = [0, 40, 624, 3744, 5108, 10200, 54912, 123552, 1098240, 1302540 ]

  let freq = Array(10).fill(0)

  for (let a = 0; a < 46; a++) {
    let c1 = cards[a]
    for (let b = a + 1; b < 47; b++) {
      let c2 = cards[b]
      for (let c = b + 1; c < 48; c++) {
        let c3 = cards[c]
        for (let d = c + 1; d < 49; d++) {
          let c4 = cards[d]
          for (let e = d + 1; e < 50; e++) {
            let c5 = cards[e]
            for (let f = e + 1; f < 51; f++) {
              let c6 = cards[f]
              for (let g = f + 1; g < 52; g++) {
                let c7 = cards[g]
                let i = eval_7hand([c1, c2, c3, c4, c5, c6, c7])
                let j = hand_rank_cactus(i)
                freq[j]++;
              }
            }
          }
        }
      }
    }
  }

  console.log(freq)
  for (let i = 1; i <= 9; i++) {
    expect(freq[i]).toBe(expected_freq[i])
  }
})
*/

it.skip('cactus eval 5', () => {
  let expected_freq = [0, 40, 624, 3744, 5108, 10200, 54912, 123552, 1098240, 1302540 ]


  let freq = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

  for (let a = 0; a < 48; a++) {
    let c1 = cards[a]
    for (let b = a + 1; b < 49; b++) {
      let c2 = cards[b]
      for (let c = b + 1; c < 50; c++) {
        let c3 = cards[c]
        for (let d = c + 1; d < 51; d++) {
          let c4 = cards[d]
          for (let e = d + 1; e < 52; e++) {
            let c5 = cards[e]
            let i = eval5_cards([c1, c2, c3, c4, c5])
            let j = hand_rank_cactus(i)
            freq[j]++;
          }
        }
      }
    }
  }

  for (let i = 1; i <= 9; i++) {
    expect(freq[i]).toBe(expected_freq[i])
  }
})
