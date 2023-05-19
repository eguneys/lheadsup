import { Game } from './game'

export type Chips = number
export type Side = 1 | 2

export type Action = string
export type BetDescription = string


export class PotDistributionPov {


  static from_fen = (fen: string) => {

    let [winshow, back_fen] = fen.split(' ')

    let win = winshow.split('win-')[1]
    let show = winshow.split('show-')[1]

    let back
    if (back_fen) {
      back = back_fen.split('-').map(_ => parseInt(_)) as [Side, number]
    }

    if (win) {
      let [side, pot] = win.split('-').map(_ => parseInt(_))
      return new PotDistributionPov(undefined, [side as Side, pot], back)
    }
    if (show) {
      return new PotDistributionPov(parseInt(show), undefined, back)
    }
  }


  constructor(
    readonly show?: Chips,
    readonly win?: [Side, Chips],
    readonly back?: [Side, Chips]) {}


  get fen() {
    let back
    if (this.back) {
      back = this.back.join('-')
    }
    if (this.show !== undefined) {
      return back ? `show-${this.show} ${back}` : `show-${this.show}`
    } else if (this.win !== undefined) {
      return back ? `win-${this.win.join('-')} ${back}` : `win-${this.win.join('-')}`
    }
  }

}


export class PotDistribution {

  static show = (pot: Chips, back?: [Side, Chips]) => new PotDistribution(pot, undefined, back)
  static win = (win: [Side, Chips], back?: [Side, Chips]) => new PotDistribution(undefined, win, back)

  static from_fen = (fen: string) => {

    let [winshow, back_fen] = fen.split(' ')

    let win = winshow.split('win-')[1]
    let show = winshow.split('show-')[1]

    let back
    if (back_fen) {
      back = back_fen.split('-').map(_ => parseInt(_)) as [Side, number]
    }

    if (win) {
      let [side, pot] = win.split('-').map(_ => parseInt(_))
      return new PotDistribution(undefined, [side as Side, pot], back)
    }
    if (show) {
      return new PotDistribution(parseInt(show), undefined, back)
    }
  }

  constructor(
    readonly show?: Chips,
    readonly win?: [Side, Chips],
    readonly back?: [Side, Chips]) {}


  pov(pov: Side) {
    let show = this.show
    let win: [Side, Chips] | undefined = this.win ? [side_pov(pov, this.win[0]), this.win[1]] : undefined
    let back: [Side, Chips] | undefined = this.back ? [side_pov(pov, this.back[0]), this.back[1]] : undefined

    return new PotDistributionPov(show, win, back)
  }

  get fen() {
    let back
    if (this.back) {
      back = this.back.join('-')
    }
    if (this.show !== undefined) {
      return back ? `show-${this.show} ${back}` : `show-${this.show}`
    } else if (this.win !== undefined) {
      return back ? `win-${this.win.join('-')} ${back}` : `win-${this.win.join('-')}`
    }
  }
}

export class Dests {

  static phase = () => new Dests(true)
  static user = () => new Dests(undefined)

  static from_fen = (fen: string) => {
    let dests = fen.split(' ')

    if (dests[0] === 'phase') {
      return Dests.phase()
    }

    let res = Dests.user()

    dests.forEach(_ => {
      if (_ === 'check') {
        res.add_check()
      } else if (_ === 'fold') {
        res.add_fold()
      } else {
        let args = _.split('-')

        if (args[0] === 'call') {
          let to_call = parseInt(args[1])
          res.add_call(to_call)
        } else if (args[0] === 'raise') {
          let [to_call, min_raise, max_raise] = args.slice(1).map(_ => parseInt(_))
          res.add_raise(to_call, min_raise, max_raise)
        } else if (args[0] === 'allin') {
          let to_rest = parseInt(args[1])
          res.add_allin(to_rest)
        }
      }
    })

    return res
  }

  constructor(
    public phase?: true,
    public check?: true,
    public fold?: true,
    public call?: Chips,
    public raise?: [Chips, Chips, Chips],
    public allin?: Chips) {}

    get fen() {
      if (this.phase) {
        return 'phase'
      }
      let res = []
      let { check, fold, call, raise, allin } = this

      if (check) {
        res.push(`check`)
      }

      if (call) {
        res.push(`call-${call}`)
      }

      if (raise) {
        res.push(`raise-${raise[0]}-${raise[1]}-${raise[2]}`)
      }

      if (allin) {
        res.push(`allin-${allin}`)
      }

      if (fold) {
        res.push('fold')
      }
      return res.join(' ')
    }

    add_check() {
      this.check = true
    }

    add_call(to_call: Chips) {
      this.call = to_call
    }


    add_raise(to_call: Chips, min_raise: Chips, max_raise: Chips) {
      this.raise = [to_call, min_raise, max_raise]
    }

    add_allin(allin: Chips) {
      this.allin = allin
    }

    add_fold() {
      this.fold = true
    }
}

export class Bet {

  static from_fen = (fen: string) => {
    if (fen === '0') {
      return undefined
    }
    let [_previous, _match, _raise, desc] = fen.split('-')

    let previous = parseInt(_previous)
    let match = _match !== undefined ? parseInt(_match) : undefined
    let raise = _raise !== undefined ? parseInt(_raise) : undefined

    return new Bet(desc, previous, match, raise)
  }

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

export class RoundPov {

  static from_fen = (round_fen: string) => {
    let [stacks_fen, ...rest] = round_fen.split(' / ')

    let stacks: [Chips, Chips] = stacks_fen.split(' ').map(_ => parseInt(_)) as [Chips, Chips]



    let pot, bets, action, distribution

    function parse_bets(rest: string) {
      bets = rest.split(' ').map((_, i) => {
          if (_[_.length - 1] === '@') {
            action = (i + 1)
            return Bet.from_fen(_.slice(0, -1))
          }
          return Bet.from_fen(_)
        })
    }

    if (rest.length === 0) {
    } else if (rest.length === 1) {

      if (rest[0][0] === 'w' || rest[0][0] === 's') {
        distribution = PotDistributionPov.from_fen(rest[0])
      } else {
        parse_bets(rest[0])
      }
    } else {
      parse_bets(rest[0])
      pot = rest[1].split('-').map(_ => parseInt(_))
    }

    return new RoundPov(stacks, pot, bets, action, distribution)
  }

  constructor(
    readonly stacks: [Chips, Chips],
    private pot?: Chips[],
    private bets?: [Bet | undefined, Bet | undefined],
    private action?: Side,
    public distribution?: PotDistributionPov
  ) {}


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

      if (this.distribution) {
        return [stacks, this.distribution.fen].join(' / ')
      } else {
        return `${stacks}`
      }
    }
  }


}

export const side_pov = (pov: Side, side: Side) => (pov === 1) ? side : next(side)

export const next = (a: Side) => a === 1 ? 2 : 1

export class Round {

  static from_fen = (blinds: Chips, button: Side, round_fen: string) => {

    let [stacks_fen, ...rest] = round_fen.split(' / ')

    let stacks: [Chips, Chips] = stacks_fen.split(' ').map(_ => parseInt(_)) as [Chips, Chips]



    let pot, bets, action, distribution

    function parse_bets(rest: string) {
      bets = rest.split(' ').map((_, i) => {
          if (_[_.length - 1] === '@') {
            action = (i + 1)
            return Bet.from_fen(_.slice(0, -1))
          }
          return Bet.from_fen(_)
        })
    }

    if (rest.length === 0) {
    } else if (rest.length === 1) {

      if (rest[0][0] === 'w' || rest[0][0] === 's') {
        distribution = PotDistribution.from_fen(rest[0])
      } else {
        parse_bets(rest[0])
      }
    } else {
      parse_bets(rest[0])
      pot = rest[1].split('-').map(_ => parseInt(_))
    }

    return new Round(blinds, button, stacks, pot, bets, action, distribution)
  }

  static from_game = (game: Game) => {
    let { small_blind, button, stacks } = game

    return new Round(small_blind, button, stacks, undefined, undefined, undefined, undefined)
  }

  static make = (buttons_fen: string) => {

    let [blinds, round, button] = buttons_fen.split(' ')

    let stacks: [Chips, Chips] = [100, 100]

    return new Round(parseInt(blinds), 1, stacks, undefined, undefined, undefined, undefined)
  }

  constructor(
    readonly small_blind: Chips, 
    readonly button: Side,
    readonly stacks: [Chips, Chips],
    private pot?: Chips[],
    private bets?: [Bet | undefined, Bet | undefined],
    private action?: Side,
    public distribution?: PotDistribution
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


  pov(s: Side) {

    let stacks: [Chips, Chips] = [
      this.stacks[side_pov(s, 1) - 1],
      this.stacks[side_pov(s, 2) - 1]
    ]

    let pot = this.pot

    let bets: [Bet | undefined, Bet| undefined] | undefined = this.bets ? [
      this.bets[side_pov(s, 1) - 1],
      this.bets[side_pov(s, 2) - 1]
    ]: undefined

    let action = this.action ? side_pov(s, this.action): undefined
    let distribution = this.distribution?.pov(s)


    return new RoundPov(stacks, pot, bets, action, distribution)

  }

  get dests() {
    if (this.bets) {

      if (!this.action) {
        return Dests.phase()
      }

      let my_stack = this.stacks[this.action! - 1]
      let my_bet = this.bets![this.action! - 1]
      let op_bet = this.bets![next(this.action!) - 1]

      let res = Dests.user()

      if (op_bet) {
        let to_call = op_bet.total - (my_bet?.total ?? 0)
        let stack_after_call = my_stack - to_call

        if (to_call > 0 && stack_after_call > 0) {
          res.add_call(to_call)
        }

        if (to_call === 0) {
          res.add_check()
        }

        let max_raise = my_stack - to_call
        let min_raise = op_bet.raise ? Math.max(my_bet?.raise ?? 0, op_bet.raise) : this.big_blind

        if (max_raise > min_raise && min_raise > 0) {
          if (op_bet.desc !== 'allin') {
            res.add_raise(to_call, min_raise, max_raise)
          }
        }
      } else {
        res.add_check()

        let to_call = 0
        let max_raise = my_stack - to_call
        let min_raise = this.big_blind

        if (min_raise > 0) {
          res.add_raise(to_call, min_raise, max_raise)
        }

      }

      let allin = my_stack

      let damage_to_stack = (op_bet?.total ?? 0) - (my_bet?.total ?? 0)
      if (op_bet?.desc === 'allin' && damage_to_stack < allin) {
      } else {
        res.add_allin(allin)
      }
      res.add_fold()

      return res
    } else {
      if (!this.distribution) {
        return Dests.phase()
      }
    }
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

      if (this.distribution) {
        return [stacks, this.distribution.fen].join(' / ')
      } else {
        return `${stacks}`
      }
    }
  }


  act(action: Action, raise?: Chips) {

    switch (action) {
      case 'phase': {
        if (!this.bets) {
          this.bets = [undefined, undefined]

          let big_stack = this.stacks[this.big_blind_side - 1]

          let bb = new Bet('bb', 0, 0, this.big_blind)
          let sb = new Bet('sb', 0, 0, this.small_blind)

          if (big_stack === this.big_blind) {
            bb = new Bet('allin', 0, 0, this.big_blind)
          }

          this.post_bet(this.big_blind_side, bb)
          this.post_bet(this.small_blind_side, sb)


          this.action = this.small_blind_side
        } else {
          if (!this.action) {

            let pot = this.bets.map(_ => (_?.total) ?? 0).reduce((a, b) => a + b)
            if (!this.pot) {

              this.pot = [pot]
              let dpot = this.pot.reduce((a, b) => a + b)

              if (!!this.bets.find(_ => _?.desc === 'fold')) {

                let winner: Side = next(
                  (this.bets.findIndex(_ => _?.desc === 'fold') + 1) as Side)

                this.bets = undefined
                this.distribution = PotDistribution.win([winner, dpot])
              } else if (!!this.bets.find(_ => _?.desc === 'allin')) {

                let back: [Side, Chips] | undefined
                if (this.bets[0]!.total < this.bets[1]!.total) {

                  back = [2, this.bets[1]!.total - this.bets[0]!.total]
                } else if (this.bets[1]!.total < this.bets[0]!.total) {
                  back = [1, this.bets[0]!.total - this.bets[1]!.total]
                }

                this.bets = undefined
                this.distribution = PotDistribution.show(dpot, back)
              } else {
                this.bets = [undefined, undefined]
                this.action = this.button
              }
            } else {

              this.pot = [...this.pot, pot]
              let dpot = this.pot.reduce((a, b) => a + b)

              if (!!this.bets.find(_ => _?.desc === 'fold')) {

                let winner: Side = next(
                  (this.bets.findIndex(_ => _?.desc === 'fold') + 1) as Side)

                this.bets = undefined
                this.distribution = PotDistribution.win([winner, dpot])
              } else if (!!this.bets.find(_ => _?.desc === 'allin')) {
                let back: [Side, Chips] | undefined
                if (this.bets[0]!.total < this.bets[1]!.total) {

                  back = [2, this.bets[1]!.total - this.bets[0]!.total]
                } else if (this.bets[1]!.total < this.bets[0]!.total) {
                  back = [1, this.bets[0]!.total - this.bets[1]!.total]
                }

                this.bets = undefined
                this.distribution = PotDistribution.show(dpot, back)
              } else if (this.pot.length === 4) {
                this.bets = undefined
                this.distribution = PotDistribution.show(dpot)
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

        if (this.bets![0] !== undefined && 
            this.bets![1] !== undefined &&
            this.bets![0].total === this.bets![1].total &&
            this.bets![0].desc !== 'bb' && this.bets![1].desc !== 'bb'
           ) {
          this.action = undefined
        } else {
          this.action = next(this.action!)
        }


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
      } break
      case 'raise': {

        let op_bet = this.bets![next(this.action!) - 1]!
        let my_bet = this.bets![this.action! - 1]!

        let previous = my_bet.total
        let match = op_bet.total - my_bet.total

        let raise_bet = new Bet('raise', previous, match, raise)


        this.post_bet(this.action!, raise_bet)

        this.action = next(this.action!)
      }
      break
      case 'allin': {

        let my_stack = this.stacks[this.action! - 1]

        let op_bet = this.bets![next(this.action!) - 1]
        let my_bet = this.bets![this.action! - 1]

        let previous = my_bet?.total ?? 0
        let match = (op_bet?.total ?? 0) - (my_bet?.total ?? 0)

        let allin = my_stack - match

        if (allin < 0) {
          match = my_stack
          allin = 0
        }

        let allin_bet = new Bet('allin', previous, match, allin)


        this.post_bet(this.action!, allin_bet)


        if (this.bets![0] !== undefined && 
            this.bets![1] !== undefined &&
            this.bets![0].desc === 'allin' && this.bets![1].desc === 'allin') {
          this.action = undefined
        } else {
          this.action = next(this.action!)
        }
      } break
      case 'fold': {

        let my_bet = this.bets![this.action! - 1]
        let previous = my_bet?.total ?? 0

        let fold = new Bet('fold', previous, undefined, undefined)

        this.post_bet(this.action!, fold)
        this.action = undefined
      } break
    }

    return this
  }

  post_bet(side: Side, bet: Bet) {
    this.stacks[side - 1] -= bet.live_bet

    this.bets![side - 1] = bet
  }
}
