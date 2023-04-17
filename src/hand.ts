export class Hand {

}


const Rank2 = 20
const Rank3 = Rank2 * 20
const Rank4 = Rank3 * 20
const Rank5 = Rank4 * 20
const Rank6 = Rank5 * 20

export const HandEvalFunctions = {
  high: (a, b, c, d, e) => Rank6 * 0 + Rank5 * a + Rank4 * b + Rank3 * c + Rank2 * d + e,
  pair: (a, b, c, d) => Rank6 * 1 + Rank4 * a + Rank3 * b + Rank2 * c + d,
  pair2: (a, b, c) => Rank6 * 2 + Rank3 * a + Rank2 * b + c,
  set: (a, b, c) => Rank6 * 3 + Rank3 * a + Rank2 * b + c,
  full: (a, b) => Rank6 * 4 + Rank2 * a + b,
  straight: (a) => Rank6 * 5 + a,
  flush: (a) => Rank6 * 6 + a,
  quad: (a) => Rank6 * 7 + a,
  sflush: (a) => Rank6 * 8 + a,
}

export type Card = string
export class HandRank {

  static from_fen = (fen: string) => {
    let [high, ...rest] = fen.split(' ')

    switch (high) {
      case 'high':
        return HandRank.high(rest)
      case 'pair':
        return HandRank.pair(rest)
      case 'pair2':
        return HandRank.pair2(rest)
      case 'set':
        return HandRank.set(rest)
      case 'full':
        return HandRank.full(rest)
      case 'straight':
        return HandRank.straight(rest[0])
      case 'flush':
        return HandRank.flush(rest[0])
      case 'quad':
        return HandRank.quad(rest[0])
      case 'sflush':
        return HandRank.sflush(rest[0])
    }
  }

  static quad = quad => new HandRank(quad)
  static high = high => new HandRank(undefined, high)
  static pair = pair => new HandRank(undefined, undefined, pair)
  static pair2 = pair2 => new HandRank(undefined, undefined, undefined, pair2)
  static set = set => new HandRank(undefined, undefined, undefined, undefined, set)
  static full = full => new HandRank(undefined, undefined, undefined, undefined, undefined, full)
  static straight = straight => new HandRank(undefined, undefined, undefined, undefined, undefined, undefined, straight)
  static flush = flush => new HandRank(undefined, undefined, undefined, undefined, undefined, undefined, undefined, flush)
  static sflush = sflush => new HandRank(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, sflush)

  constructor(public quad?: Card, 
              public high?: [Card, Card, Card, Card, Card],
             public pair?: [Card, Card, Card, Card],
             public pair2?: [Card, Card, Card],
             public set?: [Card, Card, Card],
             public full?: [Card, Card],
             public straight?: Card,
             public flush?: Card,
             public sflush?: Card) {}

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
      return `pair2 ${this.pair2.join(' ')}`
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
      return `flush ${this.flush}`
    }
  }

  get eval() {
    return rank_eval(this)
  }
}

const cards = 'AKQJT98765432'.split('')
export const card_rank = (card: string) => 14 - cards.indexOf(card)

export function rank_eval(rank: HandRank) {
  if (rank.high) {
    let [a, b, c, d, e] = rank.high.map(card_rank)
    return HandEvalFunctions.high(a, b, c, d, e)
  } else if (rank.pair) {
    let [a, b, c, d] = rank.pair.map(card_rank)
    return HandEvalFunctions.pair(a, b, c, d)
  } else if (rank.pair2) {
    let [a, b, c] = rank.pair2.map(card_rank)
    return HandEvalFunctions.pair2(a, b, c)
  } else if (rank.set) {
    let [a, b, c] = rank.set.map(card_rank)
    return HandEvalFunctions.set(a, b, c)
  } else if (rank.full) {
    let [a, b] = rank.full.map(card_rank)
    return HandEvalFunctions.full(a, b)
  } else if (rank.straight) {
    let a = card_rank(rank.straight)
    return HandEvalFunctions.straight(a)
  } else if (rank.flush) {
    let a = card_rank(rank.flush)
    return HandEvalFunctions.flush(a)
  } else if (rank.quad) {
    let a = card_rank(rank.quad)
    return HandEvalFunctions.quad(a)
  } else if (rank.sflush) {
    let a = card_rank(rank.sflush)
    return HandEvalFunctions.sflush(a)
  }
  else return 0
}

const sort_higher = (a, b) => card_rank(b) - card_rank(a)
const sort_higher_card = (a, b) => card_rank(b[0]) - card_rank(a[0])

export function rank5(hand: Array<Card>): HandRank {

  const rankCount: any = {}
  for (const card of hand) {
    rankCount[card[0]] = (rankCount[card[0]] || 0) + 1
  }
  const histogram = Object.entries(rankCount).sort((a, b) => b[1] - a[1])

  if (histogram.length === 2) {
    let [high, count] = histogram[0]
    let [high2, count2] = histogram[1]
    if (count === 4) {
      return HandRank.quad(high)
    }
    if (count === 3 && count2 === 2) {

      return HandRank.full([high, high2])
    }
  }
  if (histogram.length === 3) {
    let [high, count] = histogram[0]
    let [high2, count2] = histogram[1]
    let [high3, count3] = histogram[2]

    if (count === 3 && count2 === 1 && count3 === 1) {
      return HandRank.set([high, high2, high3])
    }

    if (count === 2 && count2 === 2 && count3 === 1) {
      return HandRank.pair2([...[high, high2].sort(sort_higher), high3])
    }
  }

  if (histogram.length === 4) {
    let [high, count] = histogram[0]
    let [high2, count2] = histogram[1]
    let [high3, count3] = histogram[2]
    let [high4, count4] = histogram[3]


    return HandRank.pair([high, high2, high3, high4].sort(sort_higher))
  }

  let is_flush = hand.every(_ => _[1] === hand[0][1])

  let is_straight = false
  hand.sort(sort_higher_card)
  let top = hand[0], bottom = hand[4]
  if (card_rank(top[0]) - card_rank(bottom[0]) === 4) {
    is_straight = true
  }
  if (is_straight && is_flush) {
    return HandRank.sflush(top[0])
  }

  if (is_straight) {
    return HandRank.straight(top[0])
  }

  if (is_flush) {
    return HandRank.flush(top[0])
  }


  return HandRank.high(hand.map(_ => _[0]))
}

export function hand_rank(hand: Array<Card>): HandRank {
  if (hand.length === 5) {
    return rank5(hand)
  }

  return [...hand.keys()]
  .map(_ => [...hand.slice(0, _), ...hand.slice(_ + 1)])
  .map(_ => hand_rank(_))
  .map<[HandRank, number]>(rank => [rank, rank_eval(rank)])
  .sort((a, b) => b[1] - a[1])[0][0]
}