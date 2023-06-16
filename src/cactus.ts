import { perm7, hash_adjust, hash_values, unique5, flushes } from './cactus_arrays'

const ranks = ['2','3','4','5','6','7','8','9','T','J','Q','K','A'] as const
type Rank = typeof ranks[number]

const suits = ['c', 'd', 'h', 's'] as const
type Suit = typeof suits[number]

type Card = `${Rank}${Suit}`

/* http://suffe.cool/poker/evaluator.html */
/* http://suffe.cool/poker/code/pokerlib.c */
/* http://senzee.blogspot.com/2006/06/some-perfect-hash.html */
const primes: Record<Rank, number> = {
  '2': 2,
  '3': 3,
  '4': 5,
  '5': 7,
  '6': 11,
  '7': 13,
  '8': 17,
  '9': 19,
  'T': 23,
  'J': 29,
  'Q': 31,
  'K': 37,
  'A': 41,
}

const rank_values: Record<Rank, number> = {
  '2': 0,
  '3': 1,
  '4': 2,
  '5': 3,
  '6': 4,
  '7': 5,
  '8': 6,
  '9': 7,
  'T': 8,
  'J': 9,
  'Q': 10,
  'K': 11,
  'A': 12
}


const rank_encoding: Record<Rank, number> = {
  '2': 0b0000000000001,
  '3': 0b0000000000010,
  '4': 0b0000000000100,
  '5': 0b0000000001000,
  '6': 0b0000000010000,
  '7': 0b0000000100000,
  '8': 0b0000001000000,
  '9': 0b0000010000000,
  'T': 0b0000100000000,
  'J': 0b0001000000000,
  'Q': 0b0010000000000,
  'K': 0b0100000000000,
  'A': 0b1000000000000
}

const suit_encoding: Record<Suit, number> = {
  'c': 0b1000,
  'd': 0b0100,
  'h': 0b0010,
  's': 0b0001
}

export function encode_card(card: Card) {
  let rank: Rank = card[0] as Rank
  let suit: Suit = card[1] as Suit
  let p = primes[rank]
  let r = rank_values[rank]
  let cdhs = suit_encoding[suit]
  let b = rank_encoding[rank]

  return (b << 16) | (cdhs << 12) | (r << 8) | p
}

export function eval5_cards(cards: Card[]) {
  return eval5(
    encode_card(cards[0]),
    encode_card(cards[1]),
    encode_card(cards[2]),
    encode_card(cards[3]),
    encode_card(cards[4]))
}

export const eval_5hand_fast = eval5

export function eval5(c1: number, c2: number, c3: number, c4: number, c5: number) {
  let q = (c1 | c2 | c3 | c4 | c5) >> 16

  if ((c1 & c2 & c3 & c4 & c5 & 0xf000) !== 0) {
    return flushes[q]
  }

  let s
  if ((s = unique5[q]) !== 0) {
    return s
  }

  q = (c1 & 0xff) * (c2 & 0xff) * (c3 & 0xff) * (c4 & 0xff) * (c5 & 0xff)

  return hash_values[find_fast(q)]
}

/* http://senzee.blogspot.com/2006/06/some-perfect-hash.html */
function find_fast(u: number) {
  let a, b, r

  u += 0xe91aaa35
  u ^= u >>> 16
  u += u << 8
  u ^= u >>> 4
  b = (u >>> 8) & 0x1ff
  a = (u + (u << 2)) >>> 19
  r = a ^ hash_adjust[b]
  return r
}

export function eval_7hand(cards: Card[]) {
  let hand = cards.map(encode_card)

  let subhand = []
  let best = 9999
  for (let i = 0; i < 21; i++) {
    for (let j = 0; j < 5; j++) {
      subhand[j] = hand[perm7[i][j]]
    }
    let q = eval5(subhand[0], subhand[1], subhand[2], subhand[3], subhand[4])
    if (q < best) {
      best = q
    }
  }
  return best
}

const HIGH_CARD = 9
const ONE_PAIR = 8
const TWO_PAIR = 7
const SET = 6
const STRAIGHT = 5
const FLUSH = 4
const FULL_HOUSE = 3
const QUADS = 2
const STRAIGHT_FLUSH = 1

export function hand_rank_cactus(val: number) {
  if (val > 6185) return HIGH_CARD;  // 1277
  if (val > 3325) return ONE_PAIR;   // 2860
  if (val > 2467) return TWO_PAIR;   // 858
  if (val > 1609) return SET;        // 858
  if (val > 1599) return STRAIGHT;   // 10
  if (val > 322)  return FLUSH;      // 1277
  if (val > 166)  return FULL_HOUSE; // 156
  if (val > 10)   return QUADS;      // 156
  return STRAIGHT_FLUSH              // 10
}
