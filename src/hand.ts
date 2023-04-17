import { next } from './round'

export class Hand {
  static from_fen = (fen: string) => {
    let [f1, f2, f3, t, r, a1, a2, b1, b2] = fen.split(' ')

    return new Hand([[a1, a2], [b1, b2]], [f1, f2, f3], t, r)
  }

  constructor(
    private hands: [[Card, Card], [Card, Card]],
    private flop: [Card, Card, Card],
    private turn: Card,
    private river: Card,
    private reveal_flop?: true,
    private reveal_turn?: true,
    private reveal_river?: true,
    private reveal_opponent?: true
  ) {}

  get fen() {
    let flop = this.flop.join(' ')
    let { turn, river } = this
    let [hand1, hand2] = this.hands

    return `${flop} ${turn} ${river} ${hand1.join(' ')} ${hand2.join(' ')}`
  }

  hand(side: Side) {

    let hand = this.hands[side - 1]
    return [...this.flop, this.turn, this.river, ...hand]
  }

  pov(side: Side) {
    let hand = this.hands[side - 1]
    let opponent_hand = this.hands[next(side) - 1]
    let flop = this.reveal_flop ? this.flop : undefined
    let turn = this.reveal_turn ? this.turn : undefined
    let river = this.reveal_river ? this.river : undefined
    let opponent = this.reveal_opponent ? opponent_hand : undefined
    return new HandPov(hand, flop, turn, river, opponent)
  }

  reveal(flop: string) {
    switch (flop) {
      case 'flop':
        this.reveal_flop = true
      break
      case 'turn':
        this.reveal_turn = true
      break
      case 'river':
        this.reveal_river = true
      break
      case 'show':
        this.reveal_opponent = true
      break
    }
  }
}


export class HandPov {

  constructor(
    public hand: [Card, Card],
    public flop?: [Card, Card, Card],
    public turn?: Card,
    public river?: Card,
    public opponent?: [Card, Card]) {}


  get fen() {
    let res = `${this.hand.join(' ')}`
    if (this.flop) {
      res += ` ${this.flop.join(' ')}`
    }
    if (this.turn) {
      res += ` ${this.turn}`
    }
    if (this.river) {
      res += ` ${this.river}`
    }
    if (this.opponent) {
      res += ` ${this.opponent.join(' ')}`
    }
    return res
  }
}
