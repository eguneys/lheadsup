import { it, expect } from 'vitest'
import { shuffle, cards } from '../src'
import { encode_card, eval5_cards, hand_rank } from '../src'

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
    expect(hand_rank(i)).toBe(1)
  })

  ones.forEach(one => {
    expect(eval5_cards(shuffle(one))).toBe(1)
  })


  let two = ['9h', 'Th', 'Jh', 'Qh', 'Kh']
  expect(eval5_cards(shuffle(two))).toBe(2)

  let ten = ['Ah', '2h', '3h', '4h', '5h']
  expect(eval5_cards(shuffle(ten))).toBe(10)
})


it.only('test eval', () => {
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
            let j = hand_rank(i)
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
