import { split_cards } from './round2'
import { lookup } from './twop/twolookup'

type Card = string

export class HandRank {

  static from_fen = (fen: string) => {
    let [high, ...rest] = fen.split(' ')

    switch (high) {
      case 'high':
        return HandRank.high(rest as [Card, Card, Card, Card, Card])
      case 'pair':
        return HandRank.pair(rest as [Card, Card, Card, Card])
      case 'ppair':
        return HandRank.pair2(rest as [Card, Card, Card])
      case 'set':
        return HandRank.set(rest as [Card, Card, Card])
      case 'full':
        return HandRank.full(rest as [Card, Card])
      case 'straight':
        return HandRank.straight(rest[0])
      case 'flush':
        return HandRank.flush(rest as [Card, Card, Card, Card, Card])
      case 'quad':
        return HandRank.quad(rest[0])
      case 'sflush':
        return HandRank.sflush(rest[0])
    }
  }

  static quad = (quad: Card) => new HandRank(quad)
  static high = (high: [Card, Card, Card, Card, Card]) => new HandRank(undefined, high)
  static pair = (pair: [Card, Card, Card, Card]) => new HandRank(undefined, undefined, pair)
  static pair2 = (pair2: [Card, Card, Card]) => new HandRank(undefined, undefined, undefined, pair2)
  static set = (set: [Card, Card, Card]) => new HandRank(undefined, undefined, undefined, undefined, set)
  static full = (full: [Card, Card]) => new HandRank(undefined, undefined, undefined, undefined, undefined, full)
  static straight = (straight: Card) => new HandRank(undefined, undefined, undefined, undefined, undefined, undefined, straight)
  static flush = (flush: [Card, Card, Card, Card, Card]) => new HandRank(undefined, undefined, undefined, undefined, undefined, undefined, undefined, flush)
  static sflush = (sflush: Card) => new HandRank(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, sflush)

  constructor(public quad?: Card, 
              public high?: [Card, Card, Card, Card, Card],
             public pair?: [Card, Card, Card, Card],
             public pair2?: [Card, Card, Card],
             public set?: [Card, Card, Card],
             public full?: [Card, Card],
             public straight?: Card,
             public flush?: [Card, Card, Card, Card, Card],
             public sflush?: Card) {}

  get rank_name() {
    if (this.quad) {
      return 'quad'
    } else if (this.high) {
      return 'high'
    } else if (this.pair) {
      return 'pair'
    } else if (this.pair2) {
      return 'ppair'
    } else if (this.set) {
      return 'set'
    } else if (this.full) {
      return 'full'
    } else if (this.straight) {
      return 'straight'
    } else if (this.flush) {
      return 'flush'
    } else if (this.sflush) {
      return 'sflush'
    }
  }

  get high_card() {
    if (this.quad) {
      return this.quad
    } else if (this.high) {
      return this.high[0]
    } else if (this.pair) {
      return this.pair[0]
    } else if (this.pair2) {
      return this.pair2[0]
    } else if (this.set) {
      return this.set[0]
    } else if (this.full) {
      return this.full[0]
    } else if (this.straight) {
      return this.straight
    } else if (this.flush) {
      return this.flush[0]
    } else if (this.sflush) {
      return this.sflush
    }
  }

  get fen() {
    if (this.quad) {
      return `quad ${this.quad}`
    }
    if (this.high) {
      return `high ${this.high.join(' ')}`
    }
    if (this.full) {
      return `full ${this.full.join(' ')}`
    }
    if (this.set) {
      return `set ${this.set.join(' ')}`
    }
    if (this.pair2) {
      return `ppair ${this.pair2.join(' ')}`
    }
    if (this.pair) {
      return `pair ${this.pair.join(' ')}`
    }

    if (this.sflush) {
      return `sflush ${this.sflush}`
    }

    if (this.straight) {
      return `straight ${this.straight}`
    }

    if (this.flush) {
      return `flush ${this.flush.join(' ')}`
    }
  }

  get hand_eval() {
    return 0
  }
}

export function hand_rank(cards: Card[]) {

  return new HandRank()
}

const twop_encode = {
  '2c': 1,
  '2d': 2,
  '2h': 3,
  '2s': 4,
  '3c': 5,
  '3d': 6,
  '3h': 7,
  '3s': 8,
  '4c': 9,
  '4d': 10,
  '4h': 11,
  '4s': 12,
  '5c': 13,
  '5d': 14,
  '5h': 15,
  '5s': 16,
  '6c': 17,
  '6d': 18,
  '6h': 19,
  '6s': 20,
  '7c': 21,
  '7d': 22,
  '7h': 23,
  '7s': 24,
  '8c': 25,
  '8d': 26,
  '8h': 27,
  '8s': 28,
  '9c': 29,
  '9d': 30,
  '9h': 31,
  '9s': 32,
  'Tc': 33,
  'Td': 34,
  'Th': 35,
  'Ts': 36,
  'Jc': 37,
  'Jd': 38,
  'Jh': 39,
  'Js': 40,
  'Qc': 41,
  'Qd': 42,
  'Qh': 43,
  'Qs': 44,
  'Kc': 45,
  'Kd': 46,
  'Kh': 47,
  'Ks': 48,
  'Ac': 49,
  'Ad': 50,
  'Ah': 51,
  'As': 52
}


export const eval_ranks = [undefined, 'high', 'pair', 'ppair', 'set', 'straight', 'flush', 'full', 'quads', 'sflush']

export function lookup_cards_str(cards: string) {
  return lookup_cards(split_cards(cards))
}

export function lookup_cards(cards: Card[]) {
  return lookup(cards.map(_ => twop_encode[_]))
}
