function split_cards(nb: number, n: string) {
  return [...Array(nb).keys()].map(_ => n.slice(_ * 2, _ * 2 + 2))
}


function sum(a: number[]) {
  return a.reduce((a, b) => a + b, 0)
}


function next_side(in_other_than_action_sides: Side[], action_side: Side) {
  return in_other_than_action_sides.find(_ => _ > action_side) ?? Math.min(...in_other_than_action_sides)
}

function find_sides<A>(_: A[], fn: (_: A) => boolean) {
  let res = []
  _.forEach((_, i) => { if (fn(_)) { res.push(i + 1) }})
  return res
}


export type Side = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export class RoundNPov {

  constructor(
    public small_blind: Chips,
    public button: Side,
    readonly stacks: Stack[],
    public pot: Chips[],
    public flop?: [Card, Card, Card],
    public turn?: Card,
    public river?: Card) {}

  get fen() {

    let { small_blind, button } = this

    let big_blind = small_blind * 2

    let header = `${small_blind}-${big_blind} ${button}`
    let stacks = this.stacks.map(_ => _.fen).join(' / ')

    let pot = this.pot.join(' ')
    if (pot !== '') {
      pot = ` ${pot} `
    }

    let middle = (this.flop?.join('') ?? '') + (this.turn ?? '') + (this.river ?? '')

    return `${header} | ${stacks} $${pot}!${middle}`
  }
}

function num(s: string) {
  return parseInt(s)
}

// 1 2 3 4
// 1 3 3
// 2 3 2
// 3 3 1
// 4 3 4
// 1 1 1
// 2 1 4
// 3 1 3
// 4 1 2
function pov_side(nb: number, pov: Side, side: Side) {
  let res = (side - pov + 1)
  if (res < 1) {
    return res + nb
  } else {
    return res
  }
}

function next(nb: number, s: Side) {
  if (s + 1 > nb) {
    return 1
  } else {
    return s + 1
  }
}

export type StackState = string

export class Call {
  constructor(readonly match: Chips) {}

  get fen() {
    return `call-${this.match}`
  }
}

export class Raise {
  constructor(readonly match: Chips, readonly min_raise: Chips) {}

  get fen() {
    return `raise-${this.match}-${this.min_raise}`
  }
}

export class Bet {

  constructor(readonly desc: BetDescription,
              readonly previous: Chips,
              readonly match?: Chips,
              readonly raise?: Chips) {}


  get total() {
    return this.previous + (this.match ?? 0) + (this.raise ?? 0)
  }

  get fen() {

    let { desc, previous, match, raise } = this

    let matches = (match !== undefined) ? `-${match}` : ''
    let raises = (raise !== undefined) ? `-${raise}` : ''
    return `${desc}-${previous}${matches}${raises}`
  }
}

export class Stack {

  static from_fen = (fen: string) => {
    let state = fen.trim()[0]
    let [stack, bet] = fen.trim().slice(1).split(' ')

    return new Stack(state, num(stack), undefined, bet)
  }

  constructor(
    public state: StackState,
    public stack: Chips,
    public hand?: [Card, Card],
    public bet?: Bet) {}

    get hide_cards() {
      let { state, stack, bet } = this
      return new Stack(state, stack, undefined, bet)
    }

  get fen() {

    let { stack, state, bet, hand } = this

    let hand_s = hand ? `${hand}` : undefined
    let bet_s = bet ? bet.fen : undefined
    let ss = hand_s ? (bet_s ? `${hand_s} ${bet_s}` : hand_s) : bet_s

    if (ss) {
      return `${state}${stack} ${ss}`
    } else {
      return `${state}${stack}`
    }
  }


  post_bet(pov: Side, desc?: BetDescription, match?: Chips, raise?: Chips) {
    if (!desc) {
      this.bet = undefined
    } else if (this.bet) {
      this.bet = new Bet(desc, this.bet.total, match, raise)
    } else {
      this.bet = new Bet(desc, 0, match, raise)
    }
    let delta = (match ?? 0) + (raise ?? 0)
    this.stack -= delta

    let res = []

    res.push(new ActionBetEvent(pov, this.bet))
    if (delta > 0) { res.push(new StackEvent(pov, delta)) }

    return res
  }
}

export class Dests {

  static get empty() { return new Dests() }
  static get deal() { return new Dests(true) }
  static get phase() { return new Dests(undefined, true) }
  static get check() { return new Dests(undefined, undefined, true) }
  static get fold() { return new Dests(undefined, undefined, undefined, true) }
  static call(call: Call) { return new Dests(undefined, undefined, undefined, undefined, call) }
  static raise(raise: Raise) { return new Dests(undefined, undefined, undefined, undefined, undefined, raise) }

  constructor(
    public deal?: true,
    public phase?: true,
    public check?: true,
    public fold?: true,
    public call?: Call,
    public raise?: Raise) {}

  get fen() {
    if (this.deal) {
      return 'deal'
    }
    if (this.phase) {
      return 'phase'
    }

    let { check, call, raise, fold } = this
    let res = []

    if (check) {
      res.push('check')
    }
    if (call) {
      res.push(call.fen)
    }
    if (raise) {
      res.push(raise.fen)
    }
    if (fold) {
      res.push('fold')
    }
    return res.join(' ')
  }
}

export class RoundN {

  static from_fen = (fen: string) => {
    let [rest, cards] = fen.split('!')
    let [rest2, pot] = rest.split('$')
    let [head, stacks] = rest2.split('|')

    let [blinds, button] = head.split(' ')
    let [small_blind] = blinds.split('-')

    let middle = cards === '' ? [] : split_cards(5, cards)

    return new RoundN(num(small_blind), num(button), stacks.split('/').map(Stack.from_fen), pot === '' ? [] : pot.split(' ').map(_ => num(_)), middle)
  }

  constructor(
    public small_blind: Chips,
    public button: Side,
    readonly stacks: Stack[],
    public pot: Chips[],
    public middle?: [Card, Card, Card, Card, Card],
    public shares?: PotShare[]) {}

  get nb() {
    return this.stacks.length
  }

  get small_blind_side() {
    return next_side(this.have_played_sides, this.button)
  }

  get big_blind_side() {
    return next_side(this.have_played_sides, this.small_blind_side)
  }

  get have_played_sides() {
    return find_sides(this.stacks, _ => _.state !== 'e')
  }

  get action_side() {
    return this.stacks.findIndex(_ => _.state === '@') + 1
  }

  get in_other_than_action_sides() {
    return find_sides(this.stacks, _ => _.state === 'i')
  }

  get in_action_next() {
    let { action_side, in_other_than_action_sides } = this

    return next_side(in_other_than_action_sides, action_side)
  }

  get action() {
    return this.stacks.find(_ => _.state === '@')
  }

  get in_other_than_actions() {
    return this.stacks.filter(_ => _.state === 'i')
  }

  get in_other_than_action_sides() {
    return find_sides(this.stacks, _ => _.state === 'i')
  }

  get ins() {
    return this.stacks.filter(_ => _.state === 'i' || _.state === '@')
  }

  get in_sides() {
    return find_sides(this.stacks, _ => _.state === 'i' || _.state === '@')
  }

  get phases() {
    return this.stacks.filter(_ => _.state === 'p')
  }

  get phase_sides() {
    return find_sides(this.stacks, _ => _.state === 'p')
  }

  get have_contributed_to_pots() {
    return this.stacks.filter(_ => _.bet)
  }

  get have_contributed_to_pot_sides() {
    return find_sides(this.stacks, _ => _.bet)
  }

  pov(side: Side) {

    let { small_blind, button, stacks, nb, pot } = this

    let pov_stacks = stacks.slice(side - 1)

    if (side !== 0) {

      pov_stacks = [...pov_stacks, ...stacks.slice(0, side - 1)]
    }

    let reveal_flop = pot.length >= 1,
      reveal_turn = pot.length >= 2,
      reveal_river = pot.length >= 3

    let flop = reveal_flop ? this.middle.slice(0, 3) : undefined
    let turn = reveal_turn ? this.middle[3] : undefined
    let river = reveal_river ? this.middle[4] : undefined

    return new RoundNPov(
      small_blind,
      pov_side(nb, side, button),
      pov_stacks.map((_, i) => i === 0 ? _ : _.hide_cards),
      this.pot,
      flop,
      turn,
      river
    )
  }

  get fen() {

    let { small_blind, button } = this

    let big_blind = small_blind * 2

    let header = `${small_blind}-${big_blind} ${button}`
    let stacks = this.stacks.map(_ => _.fen).join(' / ')

    let pot = this.pot.join(' ')
    if (pot !== '') {
      pot = ` ${pot} `
    }

    let middle = this.middle.join('')

    return `${header} | ${stacks} $${pot}!${middle}`
  }

  get dests() {
    let { stacks } = this
    let { action, in_other_than_actions } = this
    if (action) {
      let res = Dests.fold

      let action_bet = action.bet

      let bets = in_other_than_actions.map(_ => (_.bet?.total ?? 0))
      let max_bet = Math.max(...bets)

      let previous = (action_bet?.total ?? 0)
      let to_match = max_bet - previous
      
      if (to_match === 0) {
        res.check = true
      } else if (to_match > 0) {
        res.call = new Call(to_match)
      }

      let min_raise = this.small_blind * 2

      res.raise = new Raise(to_match, min_raise)

      return res
    } else {
      if (stacks[0].state === 'd') {
        return Dests.deal
      } else {
        return Dests.phase
      }
    }
  }


  act(act: string) {

    let events = new Events(this.nb)

    let [cmd, args] = act.split(' ')

    let { nb, small_blind, button } = this
    let big_blind = small_blind * 2

    let { big_blind_side } = this
    let { action_side, in_action_next } = this

    switch (cmd) {
      case 'deal':
        let side_small_blind = next(nb, button)
        let side_big_blind = next(nb, side_small_blind)
        let side_action = next(nb, side_big_blind)

        this.stacks.forEach((_, i) => {
          _.hand = args.slice(i * 4, i * 4 + 4)

          events.only(i + 1, new HandEvent(i + 1, _.hand))
        })

        this.stacks.forEach((_, i) => {

          if (i === side_action - 1) {
          events.all(this.change_state(i + 1, '@'))
          } else {
          events.all(this.change_state(i + 1, 'i'))
          }
        })


        let sb_events = this.post_bet(side_small_blind, 'sb', 0, small_blind)
        let bb_events = this.post_bet(side_big_blind, 'bb', 0, big_blind)

        sb_events.forEach(_ => events.all(_))
        bb_events.forEach(_ => events.all(_))

        this.middle = split_cards(5, args.slice(nb * 4, nb * 4 + 10))

      break
      case 'phase':
        let { phase_sides, have_contributed_to_pots } =  this

      if (this.pot.length === 0) {
        events.all(new FlopEvent(this.middle.slice(0, 3)))
      } else if (this.pot.length === 1) {
        events.all(new TurnEvent(this.middle[3]))
      } else if (this.pot.length === 2) {
        events.all(new RiverEvent(this.middle[4]))
      } 
      
        let pot_contribution = sum(have_contributed_to_pots.map(_ => _.bet.total))
        events.all(new PotEvent(pot_contribution))
        this.pot.push(pot_contribution)

        if (this.pot.length === 4) {
          phase_sides.forEach(side => {
            events.all(this.change_state(side, 's'))
            events.all(this.post_bet(side))
          })
        } else {
          phase_sides.forEach(side => {
            if (side === big_blind_side) {
              events.all(this.change_state(side, '@'))
            } else {
              events.all(this.change_state(side, 'i'))
            }
            events.all(this.post_bet(side))
          })

        }

        break
      case 'call':


      let to_match = num(args)
      events.all(this.change_state(action_side, 'i'))
      events.all(this.post_bet(action_side, 'call', to_match))

      events.all(this.change_state(in_action_next, '@'))

        break
      case 'check':
        let { in_other_than_actions, in_sides } = this

      let everyone_has_bet = in_other_than_actions.every(_ => _.bet)
      //let bets_matched = in_.every(_ => _.bet?.total === ins[0].bet?.total)
      if (everyone_has_bet) {
        in_sides.forEach(side => events.all(this.change_state(side, 'p')))
      } else {
        events.all(this.change_state(action_side, 'i'))
        events.all(this.change_state(in_action_next, '@'))
      }

        events.all(this.post_bet(action_side, 'check'))

        break
    }

    return events
  }

  private change_state(pov: Side, state: StackState) {
    this.stacks[pov - 1].state = state
    return new ChangeState(pov, state)
  }

  private post_bet(side: Side, desc?: BetDescription, match?: Chips, raise?: Chips) {
    return this.stacks[side - 1].post_bet(side, desc, match, raise)
  }

}

export abstract class Event {}


export class RiverEvent extends Event {
  constructor(readonly river: Card) {super()}

  pov(nb: number, pov: Side) {
    return new RiverEvent(this.river)
  }


  get fen() {
    return `r ${this.river}`
  }

}

export class TurnEvent extends Event {
  constructor(readonly turn: Card) {super()}

  pov(nb: number, pov: Side) {
    return new TurnEvent(this.turn)
  }


  get fen() {
    return `t ${this.turn}`
  }

}
export class FlopEvent extends Event {
  constructor(readonly flop: [Card, Card, Card]) {super()}

  pov(nb: number, pov: Side) {
    return new FlopEvent(this.flop)
  }


  get fen() {
    return `f ${this.flop.join('')}`
  }

}

export class PotEvent extends Event {

  constructor(readonly chips: Chips) {super()}

  pov(nb: number, pov: Side) {
    return new PotEvent(this.chips)
  }


  get fen() {
    return `p ${this.chips}`
  }
}

export class ActionBetEvent extends Event {

  constructor(readonly side: Side, readonly bet?: Bet) { super() }


  pov(nb: number, pov: Side) {
    return new ActionBetEvent(pov_side(nb, pov, this.side), this.bet)
  }

  get fen() {
    if (this.bet) {
      return `a ${this.side} ${this.bet.fen}`
    } else {
      return `a ${this.side}`
    }
  }
}

export class StackEvent extends Event {
  constructor(readonly side: Side, readonly delta: Chips) { super() }


  pov(nb: number, pov: Side) {
    return new StackEvent(pov_side(nb, pov, this.side), this.delta)
  }

  get fen() {
    return `s ${this.side} ${this.delta}`
  }

}

export class HandEvent extends Event {
  constructor(readonly side: Side, readonly hand: [Card, Card]) { super() }


  pov(nb: number, pov: Side) {
    return new HandEvent(pov_side(nb, pov, this.side), this.hand)
  }

  get fen() {
    return `h ${this.side} ${this.hand}`
  }
}

export class ChangeState extends Event {

  constructor(readonly side: Side, readonly state: StackState) { super() }

  pov(nb: number, pov: Side) {
    return new ChangeState(pov_side(nb, pov, this.side), this.state)
  }

  get fen() {
    return `c ${this.side} ${this.state}`
  }
}

export class Events {

  events: Map<Side, Event[]>

  constructor(readonly nb: number) {

    this.events = new Map()
    for (let i = 1; i <= nb; i++) { this.events.set(i, []) }
  }

  all(events: Event | Event[]) {

    if (!Array.isArray(events)) {

      events = [events]
    }

    for (let event of events) {
      for (let i = 1; i <= this.nb; i++) {
        this.events.get(i).push(event.pov(this.nb, i))
      }
    }
  }

  only(s: Side, event: Event) {
    this.events.get(s).push(event.pov(this.nb, s))
  }

  pov(s: Side) {
    return this.events.get(s)
  }
}
