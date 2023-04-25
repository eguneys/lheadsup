import { Side, next } from './round'
import { Card, hand_rank } from './hand_eval'

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
    private reveal_show?: true
  ) {}

  get fen() {
    let flop = this.flop.join(' ')
    let { turn, river } = this
    let [hand1, hand2] = this.hands

    return `${flop} ${turn} ${river} ${hand1.join(' ')} ${hand2.join(' ')}`
  }

  hand_rank(side: Side) {
    return hand_rank(this.hand(side))
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
    let show = this.reveal_show ? opponent_hand : undefined
    return new HandPov(hand, flop, turn, river, show)
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
        this.reveal_show = true
      break
    }
  }
}


export class HandPov {

  static from_fen = (fen: string) => {
    let [a1, a2, f1, f2, f3, t, r, b1, b2] = fen.split(' ')

    let f, o

    if (f1 && f2 && f3) {
      f = [f1, f2, f3] as [Card, Card, Card]
    }
    if (b1 && b2) {
      o = [b1, b2] as [Card, Card]
    }

    return new HandPov([a1, a2], f, t, r, o)
  }



  constructor(
    public hand: [Card, Card],
    public flop?: [Card, Card, Card],
    public turn?: Card,
    public river?: Card,
    public opponent?: [Card, Card]) {}


  get my_hand_rank() {
    if (this.flop && this.turn && this.river) {
      return hand_rank([...this.hand, ...this.flop, this.turn, this.river])
    }
  }
  get op_hand_rank() {
    if (this.flop && this.turn && this.river && this.opponent) {
      return hand_rank([...this.opponent, ...this.flop, this.turn, this.river])
    }
  }

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
