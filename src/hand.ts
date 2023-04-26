import { Side, next } from './round'
import { Card, HandRank, hand_rank } from './hand_eval'

const straight_highs: Record<string, string> = { 'A': 'AKQJT', '5': '5432A', '6': '65432', '7': '76543', '8': '87654', '9': '98765', 'T': 'T9876', 'J': 'JT987', 'Q': 'QJT98', 'K': 'KQJT9' }

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

/* https://stackoverflow.com/questions/1053843/get-the-element-with-the-highest-occurrence-in-an-array */
function mode<A>(arr: A[]){
    return arr.sort((a,b) =>
          arr.filter(v => v===a).length
        - arr.filter(v => v===b).length
    ).pop();
}


export type Hi = string

export class PovHighlight {

  constructor(
    public hand: [Hi, Hi],
    public flop: [Hi, Hi, Hi],
    public turn: Hi,
    public river: Hi,
    public opponent: [Hi, Hi]) {}

  get fen() {
    return [this.hand.join(' '), this.flop.join(' '), this.turn, this.river, this.opponent.join(' ')].join(' ')
  }

}

function highlight(hand: Card[], hand_rank: HandRank) {
  if (hand_rank.quad) {
    return hand.map(_ => _[0] === hand_rank.quad![0] ? 'h' : 's')
  }
  if (hand_rank.high) {
    return hand.map(_ => hand_rank.high!.includes(_[0]) ? 'h' : 's')
  }
  if (hand_rank.full) {
    return hand.map(_ => 
                    _[0] === hand_rank.full![0] ? 'h' : 
                    _[0] === hand_rank.full![1] ? 'h' : 
                    's')
  }
  if (hand_rank.set) {
    return hand.map(_ => 
                    _[0] === hand_rank.set![0] ? 'h' : 
                    _[0] === hand_rank.set![1] ? 'k' : 
                    _[0] === hand_rank.set![2] ? 'k' : 
                    's')
  }
  if (hand_rank.pair2) {
    let k_found = false
    return hand.map(_ => {
      let kicker = false
      if (!k_found && _[0] === hand_rank.pair2![2]) {
        kicker = true
      }
      let res = _[0] === hand_rank.pair2![0] ? 'h' :
        _[0] === hand_rank.pair2![1] ? 'h' :
        kicker ? 'k' :
        's'
      k_found = k_found || kicker
      return res
    })
  }
  if (hand_rank.pair) {
    return hand.map(_ => 
                    _[0] === hand_rank.pair![0] ? 'h' : 
                    _[0] === hand_rank.pair![1] ? 'k' : 
                    's')

  }

  if (hand_rank.sflush) {
    let highs = straight_highs[hand_rank.sflush].split('')
    return hand.map(_ => highs.includes(_[0]) ? 'h' : 's')
  }

  if (hand_rank.straight) {
    let highs = straight_highs[hand_rank.straight].split('')
    return hand.map(_ => highs.includes(_[0]) ? 'h' : 's')
  }

  if (hand_rank.flush) {
    let suit = mode(hand.map(_ => _[1]))
    return hand.map(_ => (hand_rank.flush!.includes(_[0]) && _[1] === suit) ? 'h' : 's')
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

  get flush_suit() {
    if (!this.flop) {
      return ''
    }


    return mode([...this.flop, ...this.hand].map(_ => _[1]))

  }

  get my_hand() {
    return [...this.hand, ...this.flop!, this.turn!, this.river!]
  }

  get op_hand() {
    return [...this.opponent!, ...this.flop!, this.turn!, this.river!]
  }

  get my_hand_rank() {
    if (this.flop && this.turn && this.river) {
      return hand_rank(this.my_hand)
    }
  }
  get op_hand_rank() {
    if (this.flop && this.turn && this.river && this.opponent) {
      return hand_rank(this.op_hand)
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


  get highlight() {
    let hand,
      op,
      flop,
      turn,
    river

    let { my_hand, op_hand } = this
    let { my_hand_rank, op_hand_rank } = this
    let my_eval = my_hand_rank!.hand_eval
    let op_eval = op_hand_rank!.hand_eval

    let my_hi: Hi[] = highlight(my_hand, my_hand_rank!)!,
      op_hi: Hi[] = highlight(op_hand, op_hand_rank!)!

    if (my_eval > op_eval) {
      hand = [my_hi[0], my_hi[1]]
      op = ['s', 's']
      flop = [my_hi[2], my_hi[3], my_hi[4]]
      turn = my_hi[5]
      river = my_hi[6]
    } else if (my_eval < op_eval) {
      hand = ['s', 's']
      op = [op_hi[0], op_hi[1]]
      flop = [op_hi[2], op_hi[3], op_hi[4]]
      turn = op_hi[5]
      river = op_hi[6]
    } else {
      hand = [my_hi[0], my_hi[1]]
      op = [op_hi[0], op_hi[1]]
      flop = [my_hi[2], my_hi[3], my_hi[4]]
      turn = my_hi[5]
      river = my_hi[6]
    }
        return new PovHighlight(hand as [string, string], flop as [string, string, string], turn, river, op as [string, string])
  }
}
