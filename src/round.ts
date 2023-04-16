export type Chips = number
export type Side = 1 | 2

export type Action = string
export type BetDescription = string

export class Bet {

  constructor(
    readonly desc: BetDescription,
    readonly previous: Chips,
    readonly match?: Chips,
    readonly raise?: Chips) {}

  get fen() {
    let { previous, match, raise, desc } = this
    return [previous, match ?? 0, raise ?? 0, desc].join('-')
  }

  get total() {
    return this.previous + (this.match ?? 0) + (this.raise ?? 0)
  }

  get live_bet() {
    return (this.match ?? 0) + (this.raise ?? 0)
  }
}

const next = (a: Side) => a === 1 ? 2 : 1

export class Round {
  static make = (buttons_fen: string) => {

    let [blinds, round, button] = buttons_fen.split(' ')

    let stacks: [Chips, Chips] = [100, 100]

    return new Round(10, 1, stacks, undefined, undefined, undefined)
  }

  constructor(
    readonly small_blind: Chips, 
    readonly button: Side,
    readonly stacks: [Chips, Chips],
    private pot?: Chips[],
    private bets?: [Bet | undefined, Bet | undefined],
    private action?: Side
  ) {}

  get big_blind() {
    return this.small_blind * 2
  }

  get big_blind_side() {
    return this.button
  }

  get small_blind_side() {
    return next(this.button)
  }

  get fen() {
    let stacks = this.stacks.join(' ')

    if (this.bets) {

      let bets = this.bets.map((_, i) => {
        if (_) {
          if (this.action && i === this.action - 1) {
            return `${_.fen}@`
          } else {
            return _.fen
          }
        } else {
          if (this.action && i === this.action - 1) {
            return '0@'
          } else {
            return '0'
          }
        }
      }).join(' ')


      if (this.pot) {
        let pot = this.pot.join('-')

        return [stacks, bets, pot].join(' / ')
      } else {
        return [stacks, bets].join(' / ')
      }

    } else {

      if (this.pot) {
        let pot = this.pot.reduce((a, b) => a + b)
        return [stacks, `show-${pot}`].join(' / ')
      } else {
        return `${stacks}`
      }
    }
  }


  act(action: Action) {

    switch (action) {
      case 'phase': {
        if (!this.bets) {
          this.bets = [undefined, undefined]

          let bb = new Bet('bb', 0, 0, this.big_blind)
          let sb = new Bet('sb', 0, 0, this.small_blind)

          this.post_bet(this.big_blind_side, bb)
          this.post_bet(this.small_blind_side, sb)


          this.action = this.small_blind_side
        } else {
          if (!this.action) {

            let pot = this.bets.map(_ => _!.total).reduce((a, b) => a + b)
            if (!this.pot) {
              this.pot = [pot]
              this.bets = [undefined, undefined]
              this.action = this.button
            } else {

              this.pot = [...this.pot, pot]

              if (this.pot.length === 4) {
                this.bets = undefined
              } else {
                this.bets = [undefined, undefined]
                this.action = this.button
              }
            }
          }
        }
      } break
      case 'call': {

        let to_call_bet = this.bets![next(this.action!) - 1]!
        let my_bet = this.bets![this.action! - 1]!

        let previous = my_bet.total
        let match = to_call_bet.total - my_bet.total

        let call = new Bet('call', previous, match, 0)


        this.post_bet(this.action!, call)

        this.action = next(this.action!)
      } break
      case 'check': {
        let my_bet = this.bets![this.action! - 1]
        let previous = my_bet?.total ?? 0
        let check = new Bet('check', previous, 0, 0)

        this.post_bet(this.action!, check)


        if (this.bets![0] !== undefined && 
            this.bets![1] !== undefined &&
            this.bets![0].total === this.bets![1].total) {
          this.action = undefined
        } else {
          this.action = next(this.action!)
        }
      }
    }

    return this
  }

  post_bet(side: Side, bet: Bet) {
    this.stacks[side - 1] -= bet.live_bet

    this.bets![side - 1] = bet
  }
}
