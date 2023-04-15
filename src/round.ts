export type Chips = number
export type Side = 1 | 2

export type Action = string

export class Bet {

  constructor(
    readonly amount: Chips,
    readonly desc: BetDescription) {}

}

export class Round {
  static make = (buttons_fen: string) => {

    let [blinds, round, button] = buttons_fen.split(' ')

    return new Round(10, 1)
  }

  stacks: [Chips, Chips]
  bets?: [Bet | undefined, Bet | undefined]

  constructor(
    readonly small_blind: Chips,
    readonly button: Side) {
    
      this.stacks = [100, 100]
      this.bets = undefined
    }

  get fen() {
    let stacks = this.stacks.join(' ')

    return `${stacks}`
  }


  act(action: Action) {

    switch (action) {
      case 'phase':
        break
    }

    return this
  }
}
