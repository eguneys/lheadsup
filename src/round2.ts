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
    public river?: Card,
    public shares?: PotShare[]) {}

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

    let shares = (this.shares?.map(_ => _.fen).join(' ') ?? '')
    if (shares) {
      shares = ` shares ${shares}`
    }

    return `${header} | ${stacks} $${pot}!${middle}${shares}`
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

export class PotShare {
  static win(n: Side, chips: Chips) { return new PotShare([n, chips]) }

  constructor(readonly win?: [Side, Chips]) {}


  pov(nb: number, pov: Side) {
    let { win } = this

    let pov_win = win ? [pov_side(nb, pov, win[0]), win[1]] : undefined
    return new PotShare(pov_win)
  }

  get fen() {
    let { win } = this
    if (win) {
      return `win-${win[0]}-${win[1]}`
    }
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
      let { state, stack, bet, hand } = this
      let show_if_showdown = state === 's' ? hand : undefined
      return new Stack(state, stack, show_if_showdown, bet)
    }

  get fen() {

    let { stack, state, bet, hand } = this

    let hand_s = hand ? `${hand.join('')}` : undefined
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
  static get showdown() { return new Dests(undefined, undefined, true) }
  static get share() { return new Dests(undefined, undefined, undefined, true) }
  static get check() { return new Dests(undefined, undefined, undefined, undefined, true) }
  static get fold() { return new Dests(undefined, undefined, undefined, undefined, undefined, true) }
  static call(call: Call) { return new Dests(undefined, undefined, undefined, undefined, undefined, undefined, call) }
  static raise(raise: Raise) { return new Dests(undefined, undefined, undefined, undefined, undefined, undefined, undefined, raise) }

  constructor(
    public deal?: true,
    public phase?: true,
    public showdown?: true,
    public share?: true,
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
    if (this.showdown) {
      return 'showdown'
    }
    if (this.share) {
      return 'share'
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

  find_stack_sides_with_states(n: StackState | StackState[]) {
    if (!Array.isArray(n)) {
      n = [n]
    }

    return find_sides(this.stacks, _ => n.includes(_.state))
  }

  find_stacks_with_states(n: StackState | StackState[]) {
    if (!Array.isArray(n)) {
      n = [n]
    }

    return this.stacks.filter(_ => n.includes(_.state))
  }

  get have_played_sides() {
    return this.find_stack_sides_with_states(['p', 'a', 'f', 'd', 'i', '@', 's'])
  }


  get small_blind_side() {
    return next_side(this.have_played_sides, this.button)
  }

  get big_blind_side() {
    return next_side(this.have_played_sides, this.small_blind_side)
  }

  get action_side() {
    return this.find_stack_sides_with_states('@')[0]
  }

  get action() {
    return this.stacks[this.action_side - 1]
  }

  get in_other_than_action_sides() {
    return this.find_stack_sides_with_states('i')
  }

  get in_other_than_actions() {
    return this.find_stacks_with_states('i')
  }

  get in_action_next() {
    let { action_side, in_other_than_action_sides } = this

    return next_side(in_other_than_action_sides, action_side)
  }

  get ins() {
    return this.find_stacks_with_states(['i', '@'])
  }

  get in_sides() {
    return this.find_stack_sides_with_states(['i', '@'])
  }

  get phases() {
    return this.find_stacks_with_states('p')
  }

  get phase_sides() {
    return this.find_stack_sides_with_states('p')
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
      river,
      this.shares
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

    let middle = this.middle?.join('') ?? ''

    let shares = this.shares ? 
      ` shares ${this.shares.map(_ => _.fen).join(' ')}` : ''

    return `${header} | ${stacks} $${pot}!${middle}${shares}`
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
      if (this.find_stack_sides_with_states('d').length > 0) {
        return Dests.deal
      } if (this.find_stack_sides_with_states('s').length > 0) {
        if (this.shares) {
          return Dests.share
        } else {
          return Dests.showdown
        }
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

    switch (cmd) {
      case 'deal': {
        let { small_blind_side, big_blind_side } = this

        let deals = this.find_stacks_with_states('d')
        let deal_sides = this.find_stack_sides_with_states('d')
        let side_action_preflop = next_side(deal_sides, big_blind_side)

        deal_sides.forEach((side, i) => {
          let _ = this.stacks[side - 1]
          _.hand = args.slice(i * 4, i * 4 + 4)

          events.only(side, new HandEvent(side, _.hand))
        })

        deal_sides.forEach((side, i) => {
          let _ = this.stacks[side - 1]

          if (side === side_action_preflop) {
            events.all(this.change_state(side, '@'))
          } else {
            events.all(this.change_state(side, 'i'))
          }
        })


        let sb_events = this.post_bet(small_blind_side, 'sb', 0, small_blind)
        let bb_events = this.post_bet(big_blind_side, 'bb', 0, big_blind)

        sb_events.forEach(_ => events.all(_))
        bb_events.forEach(_ => events.all(_))

        this.middle = split_cards(5, args.slice(nb * 4, nb * 4 + 10))

        deal_sides.forEach((side, i) => {
          let _ = this.stacks[side - 1]
          _.hand = split_cards(2, args.slice(i * 4))
        })
      } break
      case 'phase': {
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

          let showdowns = this.find_stack_sides_with_states('s')
          showdowns.forEach(side => {
            events.others(side, new RevealHand(side, this.stacks[side - 1].hand))
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

      } break
      case 'showdown': {

        let pot_winner = 1
        let pot_chips = sum(this.pot)

        events.all(this.pot_share(PotShare.win(pot_winner, pot_chips)))

      } break
      case 'call': {

        let { action_side, in_action_next } = this

        let to_match = num(args)
        events.all(this.change_state(action_side, 'i'))
        events.all(this.post_bet(action_side, 'call', to_match))

        events.all(this.change_state(in_action_next, '@'))
      } break
      case 'share': {

        let { shares, have_played_sides } = this

        have_played_sides.forEach(side => {
          events.all(this.change_state(side, 'd'))
          events.all(this.collect_card(side))
        })

        events.all(this.collect_pot())

        shares.forEach(share => {
          events.all(this.pot_share_stack_add(share))
        })

        events.all(this.button_next())
      } break
      case 'check': {
        let { action_side, in_action_next } = this
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
    }  break
  }

  return events
}

  private button_next() {
    let deals = this.find_stack_sides_with_states('d')
    this.button = next_side(deals, this.button)

    return new ButtonEvent(this.button)
  }

  private pot_share_stack_add(share: PotShare) {

    let { win } = share

    if (win) {
      let [side, chips] = win

      this.stacks[side - 1].stack += chips
      
      return new StackAddEvent(side, chips)
    }
  }

  private collect_pot() {
    this.pot = []
    this.shares = undefined
    this.middle = undefined
    return new CollectPot()
  }

  private collect_card(side: Side) {
    this.stacks[side - 1].hand = undefined
    return new CollectHand(side)
  }

  private pot_share(share: PotShare) {
    if (!this.shares) {
      this.shares = []
    }
    this.shares.push(share)
    return new PotShareEvent(share)
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

export class ButtonEvent extends Event {
  constructor(readonly side: Side) { super() }

  pov(nb: number, pov: Side) {
    return new ButtonEvent(pov_side(nb, pov, this.side))
  }

  get fen() {
    return `b ${this.side}`
  }
}

export class StackAddEvent extends Event {
  constructor(readonly side: Side, readonly delta: Chips) { super() }


  pov(nb: number, pov: Side) {
    return new StackAddEvent(pov_side(nb, pov, this.side), this.delta)
  }

  get fen() {
    return `S ${this.side} ${this.delta}`
  }

}



export class CollectPot extends Event {

  pov(nb: number, pov: Side) {
    return this
  }

  get fen() {
    return `C`
  }
}

export class CollectHand extends Event {
  constructor(readonly side: Side) { super() }

  pov(nb: number, pov: Side) {
    return new CollectHand(pov_side(nb, pov, this.side))
  }

  get fen() {
    return `o ${this.side}`
  }

}

export class RevealHand extends Event {

  constructor(readonly side: Side, readonly hand: [Card, Card]) {super()}


  pov(nb: number, pov: Side) {
    return new RevealHand(pov_side(nb, pov, this.side), this.hand)
  }

  get fen() {
    return `r ${this.side} ${this.hand.join('')}`
  }

}

export class PotShareEvent extends Event {
  constructor(readonly share: PotShare) {super()}

  pov(nb: number, pov: Side) {
    return new PotShareEvent(this.share.pov(nb, pov))
  }


  get fen() {
    return `w ${this.share.fen}`
  }

}
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

  others(pov: Side, events: Event | Event[]) {

    if (!Array.isArray(events)) {

      events = [events]
    }

    for (let event of events) {
      for (let i = 1; i <= this.nb; i++) {
        if (i === pov) continue
        this.events.get(i).push(event.pov(this.nb, i))
      }
    }

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
