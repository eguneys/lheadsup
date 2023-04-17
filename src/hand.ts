export class Hand {

}

export type Card = string
export class HandRank {

  static quad = quad => new HandRank(quad)
  static high = high => new HandRank(undefined, high)

  constructor(public quad?: Card, 
              public high?: [Card, Card, Card, Card, Card]) {}

  get fen() {
    if (this.quad) {
      return `quad ${this.quad}`
    }
    if (this.high) {
      return `high ${this.high.join(' ')}`
    }
  }

  get eval() {
    return rank_eval(this)
  }
}

export function rank_eval(rank: HandRank) {
  return 0
}

export function rank5(hand: Array<Card>): HandRank {

  const rankCount: any = {}
  for (const card of hand) {
    rankCount[card[0]] = (rankCount[card[0]] || 0) + 1
  }
  const histogram = Object.entries(rankCount).sort((a, b) => b[1] - a[1])

  if (histogram.length === 2) {
    let [high, count] = histogram[0]
    if (count === 4) {
      return HandRank.quad(high)
    }
  }

  return HandRank.high([5, 4, 3, 2, 1])
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
