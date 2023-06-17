import { lookup } from '../twop'
import { Rank, Card, cards, split_cards } from '../cards'

import data from './7462.json'
import { 
  pair_kickers,
  ppair_kickers,
  flush_kickers,
  set_kickers } from './flush_kickers.json'

const twop_encode: Record<Card, number> = { '2c': 1, '2d': 2, '2h': 3, '2s': 4, '3c': 5, '3d': 6, '3h': 7, '3s': 8, '4c': 9, '4d': 10, '4h': 11, '4s': 12, '5c': 13, '5d': 14, '5h': 15, '5s': 16, '6c': 17, '6d': 18, '6h': 19, '6s': 20, '7c': 21, '7d': 22, '7h': 23, '7s': 24, '8c': 25, '8d': 26, '8h': 27, '8s': 28, '9c': 29, '9d': 30, '9h': 31, '9s': 32, 'Tc': 33, 'Td': 34, 'Th': 35, 'Ts': 36, 'Jc': 37, 'Jd': 38, 'Jh': 39, 'Js': 40, 'Qc': 41, 'Qd': 42, 'Qh': 43, 'Qs': 44, 'Kc': 45, 'Kd': 46, 'Kh': 47, 'Ks': 48, 'Ac': 49, 'Ad': 50, 'Ah': 51, 'As': 52 }

/* http://suffe.cool/poker/7462.html */

/* https://github.com/eguneys/XPokerEval/blob/master/XPokerEval.TwoPlusTwo/generate_table.cpp#L245 */

let nb_rs = [0, 1277, 2860, 858, 858, 10, 1277, 156, 156, 10]
let nb_rs_sum = [0, 0, 1277, 4137, 4995, 5853, 5863, 7140, 7296, 7452, 7462]
export function get_klass(cards: Card[]) {
  let l = lookup_cards(cards)
  let h = ((l >> 12) & 0xf)
  let r = l & 0x0fff

  let s = nb_rs_sum[h]
  let klass = s + r

  return [klass, h, r]
}

function kicker_math(r: number, ds: number[]) {
  let ds_sums = ds.map((d, i) =>
    d * ds.slice(i + 1).reduce((a, b) => a * b, 1))

  let ranges = ds.map(d => [...Array(13).keys()].map(i => 13 - i))

  let res = []
  for (let i = 0; i < ds.length; i++) {
    let d = ds[i]
    let a = Math.ceil(r / (ds_sums[i + 1] ?? 1))
    r -= (a - 1) * ds_sums[i + 1]

    res.push(ranges[i][d - a])

    for (let j = i + 1; j < ranges.length; j++) {
      ranges[j].splice(ranges[j].indexOf(res[res.length - 1]), 1)
    }
  }
  return res
}

function decode_pair_kicker(n: number) {
  return [n & 0xf, n >> 4 & 0xf, n >> 8 & 0xf, n >> 12 & 0xf]
}

function decode_set_kicker(n: number) {
  return [n & 0xf, n >> 4 & 0xf, n >> 8 & 0xf]
}

function decode_flush_kicker(n: number) {
  return [n & 0xf, n >> 4 & 0xf, n >> 8 & 0xf, n >> 12 & 0xf, n >> 16 & 0xf]
}

function flush_kicker_math(r: number) {
  return decode_flush_kicker(flush_kickers[r - 1])
}

function set_kicker_math(r: number) {
  return decode_set_kicker(set_kickers[r - 1])
}

function ppair_kicker_math(r: number) {
  return decode_set_kicker(ppair_kickers[r - 1])
}

function pair_kicker_math(r: number) {
  return decode_pair_kicker(pair_kickers[r - 1])
}

function get_kickers(klass: number, h: number, r: number) {
  let min_r = nb_rs_sum[h]
  let max_r = nb_rs_sum[h + 1]
  let nb_r = max_r - min_r
  switch (h) {
    case 9: case 5:
      return kicker_math(r, [10])
    case 8: case 7:
      return kicker_math(r, [13, 12])
    case 6:
      return flush_kicker_math(r)
    case 4:
      return set_kicker_math(r)
    case 3:
      return ppair_kicker_math(r)
    case 2:
      return pair_kicker_math(r)
    case 1:
      return flush_kicker_math(r)
    default: return [0]
  }
}


const ranks_asc = '23456789TJQKA'

const rank_long: Record<Rank, [string, string]> = {
  '2': ['Deuce', 'Deuces'],
  '3': ['Trey', 'Treys'],
  '4': ['Four', 'Fours'],
  '5': ['Five', 'Fives'],
  '6': ['Six', 'Sixes'],
  '7':  ['Seven', 'Sevens'],
  '8':  ['Eight', 'Eights'],
  '9':  ['Nine', 'Nines'],
  'T':  ['Ten', 'Tens'],
  'J':  ['Jack', 'Jacks'],
  'Q':  ['Queen', 'Queens'],
  'K':  ['King', 'Kings'],
  'A':  ['Ace', 'Aces']
}

const descs = ['', '1-High', 'Pair of 1_', 
  '1_ and 2_', 'Three 1_', '1-High Straight', '1-High Flush', '1_ Full over 2_',
'Four 1_', '1-High Straight Flush']

function get_desc(klass: number, h: number, r: number, kickers: number[]) {
  let ones = kickers.map(_ => rank_long[ranks_asc[_ - 1]])

  if (klass === 7462) {
    return 'Royal Flush'
  } else {
    return descs[h]
    .replace('1_', ones[0][1])
    .replace('1', ones[0][0])
    .replace('2_', ones[1]?.[1])
    .replace('2', ones[1]?.[0])
  }
}

const short_descs = ['', 'high xyzXY', 'pair xyzX', 
  'ppair xyz', 'set xyz', 'straight x', 'flush xyzXY', 'full xy',
'quads x', 'sflush x']
function get_shorter_desc(klass: number, h: number, r: number, kickers: number[]) {
  let ones = kickers.map(_ => ranks_asc[_ - 1])
  return short_descs[h]
  .replace('x', ones[0])
  .replace('y', ones[1])
  .replace('z', ones[2])
  .replace('X', ones[3])
  .replace('Y', ones[4])
}

const abbrs = ['', 'HC', '1P', '2P', '3K', 'S', 'F', 'FH', '4K', 'SF']

function get_abbr(klass: number, h: number, r: number) {
  return abbrs[h]
}



export function get_klass_info(cards: Card[]) {
  let [klass, h, r] = get_klass(cards),
    abbr = get_abbr(klass, h, r),
    kickers = get_kickers(klass, h, r),
    desc = get_desc(klass, h, r, kickers),
    short_desc = get_shorter_desc(klass, h, r, kickers)

  return {
    klass,
    abbr,
    desc,
    short_desc,
    kickers
  }
}

export function get_klass_info_str(cards: string) {
  return get_klass_info(split_cards(cards))
}


export function lookup_cards_str(cards: string) {
  return lookup_cards(split_cards(cards))
}

export function lookup_cards(cards: Card[]) {
  return lookup(cards.map(_ => twop_encode[_]))
}

