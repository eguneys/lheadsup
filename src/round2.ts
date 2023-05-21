function split_cards(nb: number, n: string) {
  return [...Array(nb).keys()].map(_ => n.slice(_ * 2, _ * 2 + 2))
}

const all_equal = arr => arr.every( v => v === arr[0] )

function sum(a: number[]) {
  return a.reduce((a, b) => a + b, 0)
}

let next_phases = {
  'p': 'f',
  'f': 't',
  't': 'r'
}
function next_phase(phase: Phase) {
  return next_phases[phase]
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
    public pot?: Pot,
    public flop?: [Card, Card, Card],
    public turn?: Card,
    public river?: Card,
    public shares?: PotShare[]) {}

  get fen() {

    let { small_blind, button } = this

    let big_blind = small_blind * 2

    let header = `${small_blind}-${big_blind} ${button}`
    let stacks = this.stacks.map(_ => _.fen).join(' / ')

    let pot = this.pot?.fen
    if (pot) {
      pot = ` ${pot} `
    } else {
      pot = ''
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
  static back(n: Side, chips: Chips) { return new PotShare(undefined, [n, chips]) }

  constructor(readonly win?: [Side, Chips], readonly back?: [Side, Chips]) {}


  pov(nb: number, pov: Side) {
    let { win, back } = this

    let pov_win = win ? [pov_side(nb, pov, win[0]), win[1]] : undefined
    let pov_back = back ? [pov_side(nb, pov, back[0]), back[1]] : undefined
    return new PotShare(pov_win, pov_back)
  }

  get fen() {
    let { win, back } = this
    if (win) {
      return `win-${win[0]}-${win[1]}`
    }
    if (back) {
      return `back-${back[0]}-${back[1]}`
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

  static from_fen = (fen: string) => {
    let [desc, previous, match, raise] = fen.split('-')

    return new Bet(desc, num(previous), match ? num(match) : undefined, raise ? num(raise) : undefined)
  }

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
    let [stack, hand, bet] = fen.trim().slice(1).split(' ')

    if (!hand) {
    } else if (hand.length === 4 && hand !== 'fold') {
    } else {
      bet = hand
      hand = undefined
    }

    return new Stack(state, num(stack), hand ? split_cards(2, hand) : undefined, bet ? Bet.from_fen(bet) : undefined)
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
  static get fin() { return new Dests(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true) }
  static get win() { return new Dests(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true) }

  constructor(
    public deal?: true,
    public phase?: true,
    public showdown?: true,
    public share?: true,
    public check?: true,
    public fold?: true,
    public call?: Call,
    public raise?: Raise,
    public fin?: true,
    public win?: true) {}

  get fen() {
    if (this.win) {
      return 'win'
    }
    if (this.fin) {
      return 'fin'
    }
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

export class Pot {

  static from_fen = (fen: string) => {
    return new Pot(0, [])
  }

  static empty = () => new Pot(0, [])

  constructor(
    public chips: Chips,
    public sides: Side[],
    public side_pots?: Pot[]) {}

  add_bet(side: Side, bet: Bet, folded?: true) {
    if (!folded && !this.sides.includes(side)) {
      this.sides.push(side)
    }
    this.chips += bet.total

    if (bet.total > 0) {
      return [new PotAddBet(side, bet.total)]
    }
    return []
  }

  side_pot(shorts: Side[], chips: Chips) {

    let side_sides = this.sides
    let side_chips = chips * side_sides.length

    if (!this.side_pots) {
      this.side_pots = []
    }

    let side_pot = new Pot(side_chips, side_sides)
    this.side_pots.push(side_pot)

    this.sides = this.sides.filter(_ => !shorts.includes(_))
    this.chips -= side_chips


    return new SidePotEvent(shorts, chips)
  }


  get fen() {

    let side_pots = this.side_pots ? 
      `side ${this.side_pots.map(_ => _.fen).join(' ')}` : ''

    return `${this.chips}-${this.sides.join('')}${side_pots}`
  }
}

export type Phase = string

export class RoundN {

  static from_fen = (fen: string) => {
    let [rest, f_cards] = fen.split('!')
    let [rest2, pot] = rest.split('$')
    let [head, stacks] = rest2.split('|')

    let [blinds, button] = head.split(' ')
    let [small_blind] = blinds.split('-')

    let middle = f_cards === '' ? [] : split_cards(5, f_cards.slice(1))
    let phase = f_cards === '' ? undefined : f_cards[0]

    return new RoundN(num(small_blind), num(button), stacks.split('/').map(Stack.from_fen), pot === '' ? undefined : Pot.from_fen(pot), middle, phase)
  }

  constructor(
    public small_blind: Chips,
    public button: Side,
    readonly stacks: Stack[],
    public pot?: Pot,
    public middle?: [Card, Card, Card, Card, Card],
    public phase?: Phase,
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
    return this.find_stack_sides_with_states(['i'])
  }

  get in_other_than_actions() {
    return this.find_stacks_with_states(['i'])
  }

  get allin_and_in_other_than_actions() {
    return this.find_stacks_with_states(['i', 'a'])
  }

  get allin_and_in_other_than_action_sides() {
    return this.find_stack_sides_with_states(['i', 'a'])
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

  get allin_sides() {
    return this.find_stack_sides_with_states('a')
  }

  get fold_sides() {
    return this.find_stack_sides_with_states('f')
  }


  get have_contributed_to_pots() {
    return this.stacks.filter(_ => _.bet)
  }

  get have_contributed_to_pot_sides() {
    return find_sides(this.stacks, _ => _.bet)
  }

  pov(side: Side) {

    let { small_blind, button, phase, stacks, nb, pot } = this

    let pov_stacks = stacks.slice(side - 1)

    if (side !== 1) {

      pov_stacks = [...pov_stacks, ...stacks.slice(0, side - 1)]
    }

    let reveal_flop = phase !== 'p',
      reveal_turn = phase === 't' || phase === 'r',
      reveal_river = phase === 'r'

    let flop = reveal_flop ? this.middle?.slice(0, 3) : undefined
    let turn = reveal_turn ? this.middle?.[3] : undefined
    let river = reveal_river ? this.middle?.[4] : undefined

    return new RoundNPov(
      small_blind,
      pov_side(nb, side, button),
      pov_stacks.map((_, i) => i === 0 ? _ : _.hide_cards),
      this.pot,
      flop,
      turn,
      river,
      this.shares?.map(_ => _.pov(nb, side))
    )
  }

  get fen() {

    let { small_blind, button, phase } = this

    let big_blind = small_blind * 2

    let header = `${small_blind}-${big_blind} ${button}`
    let stacks = this.stacks.map(_ => _.fen).join(' / ')

    let pot = this.pot?.fen
    if (pot) {
      pot = ` ${pot} `
    } else {
      pot = ''
    }

    let middle = this.middle?.join('') ?? ''

    let shares = this.shares ? 
      ` shares ${this.shares.map(_ => _.fen).join(' ')}` : ''

    return `${header} | ${stacks} $${pot}!${phase??''}${middle}${shares}`
  }

  get dests() {
    let { stacks } = this
    let { action, allins, allin_and_in_other_than_actions } = this
    if (action) {
      let res = Dests.fold

      let action_stack = action.stack
      let action_bet = action.bet

      let bets = allin_and_in_other_than_actions.map(_ => (_.bet?.total ?? 0))
      let raises = allin_and_in_other_than_actions.map(_ => (_.bet?.raise ?? 0))
      let max_bet = Math.max(...bets)
      let max_raise = Math.max(...raises)

      let previous = (action_bet?.total ?? 0)
      let to_match = max_bet - previous
      
      if (to_match === 0) {
        res.check = true
      } else if (to_match > 0 && action_stack > to_match) {
        res.call = new Call(to_match)
      }

      let min_raise = Math.max(this.small_blind * 2, max_raise)

      res.raise = new Raise(to_match, min_raise)

      return res
    } else {
      if (this.find_stack_sides_with_states('w').length > 0) {
        return Dests.win
      } else if (this.find_stack_sides_with_states('x').length > 0) {
        return Dests.fin
      } else if (this.find_stack_sides_with_states('d').length > 0) {
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

        let big_blind_stack = this.stacks[big_blind_side - 1].stack
        let big_blind_all_in = big_blind_stack <= big_blind

        let small_blind_stack = this.stacks[small_blind_side - 1].stack
        let small_blind_all_in = small_blind_stack <= small_blind

        deal_sides.forEach((side, i) => {
          let _ = this.stacks[side - 1]

          if (small_blind_all_in && side === small_blind_side) {
            events.all(this.change_state(side, 'a'))
          } else if (big_blind_all_in && side === big_blind_side) {
            events.all(this.change_state(side, 'a'))
          } else if (side === side_action_preflop) {
            events.all(this.change_state(side, '@'))
          } else {
            events.all(this.change_state(side, 'i'))
          }
        })

        let bb_events
        if (big_blind_all_in) {
          bb_events = this.post_bet(big_blind_side, 'allin', 0, big_blind_stack)
        } else {
          bb_events = this.post_bet(big_blind_side, 'bb', 0, big_blind)
        }

        let sb_events
       
        if (small_blind_all_in) {
          sb_events = this.post_bet(small_blind_side, 'allin', 0, small_blind_stack)
        } else {
          sb_events = this.post_bet(small_blind_side, 'sb', 0, small_blind)
        }

        events.all(sb_events)
        events.all(bb_events)

        this.middle = split_cards(5, args.slice(nb * 4, nb * 4 + 10))

        deal_sides.forEach((side, i) => {
          let _ = this.stacks[side - 1]
          _.hand = split_cards(2, args.slice(i * 4))

          events.only(side, new HandEvent(side, _.hand))
        })


        this.phase = 'p'
      } break
      case 'phase': {
        let { fold_sides, allin_sides, phase_sides, phase } =  this

        let no_player_left = phase_sides.length <= 1
        let allins = this.find_stack_sides_with_states('a')
        let everyone_has_folded = no_player_left && allins.length === 0

        if (!this.pot) {
          this.pot = Pot.empty()
        }

        [...phase_sides, ...allin_sides].forEach(side => {
          let _ = this.stacks[side - 1]

          events.all(this.pot.add_bet(side, _.bet))
        })

        fold_sides.forEach(side => {
          let _ = this.stacks[side - 1]
          if (_.bet) {
            events.all(this.pot.add_bet(side, _.bet, true))
          }
        })

        {
          let decrease = 0
          allin_sides.sort((a, b) => {
            let abet = this.stacks[a - 1].bet.total
            let bbet = this.stacks[b - 1].bet.total
            return abet - bbet
          }).forEach(side => {
            let chips = this.stacks[side - 1].bet.total - decrease
            events.all(this.pot.side_pot([side], chips))
            decrease += chips
          })
        }

        [...allin_sides, ...fold_sides, ...phase_sides].forEach(side => {
          events.all(this.post_bet(side))
        })

        if (!everyone_has_folded) {
          if (phase === 'p') {
            events.all(new FlopEvent(this.middle.slice(0, 3)))
          } else if (phase === 'f') {
            events.all(new TurnEvent(this.middle[3]))
          } else if (phase === 't') {
            events.all(new RiverEvent(this.middle[4]))
          } 
        }
        
        if (phase === 'r') {
          phase_sides.forEach(side => {
            events.all(this.change_state(side, 's'))
          })

          let showdowns = this.find_stack_sides_with_states('s')
          showdowns.forEach(side => {
            events.others(side, new HandEvent(side, this.stacks[side - 1].hand))
          })
        } else if (no_player_left) {

          if (everyone_has_folded) {

            phase_sides.forEach(side => {
              events.all(this.change_state(side, 'w'))
            })


          } else {
            allins.forEach(side => {
              events.others(side, new HandEvent(side, this.stacks[side - 1].hand))
            })


            if (phase === 'p') {
              events.all(new TurnEvent(this.middle[3]))
              events.all(new RiverEvent(this.middle[4]))
            } else if (phase === 'f') {
              events.all(new RiverEvent(this.middle[4]))
            } 

            [...phase_sides, ...allin_sides].forEach(side => {
              events.all(this.change_state(side, 's'))
            })

          }
        } else {

          let big_blind_has_folded = this.stacks[big_blind_side - 1].state === 'f'
          let next_action_side = big_blind_has_folded ? next_side(phase_sides, big_blind_side) : big_blind_side

          phase_sides.forEach(side => {
            if (side === next_action_side) {
              events.all(this.change_state(side, '@'))
            } else {
              events.all(this.change_state(side, 'i'))
            }
          })

          this.phase = next_phase(this.phase)
        }
      } break
      case 'showdown': {


        [this.pot, ...this.pot?.side_pots ?? []].forEach(pot => {
          let { sides, chips } = pot
          if (sides.length === 0) {
          } else if (sides.length === 1) {
            events.all(this.pot_share(PotShare.back(sides[0], chips)))
          } else {
            let pot_winner = sides[0]

            events.all(this.pot_share(PotShare.win(pot_winner, chips)))
          }
        })

      } break
      case 'call': {

        let { action_side, in_action_next } = this

        let { ins, in_sides } = this


        let to_match = num(args)
        events.all(this.post_bet(action_side, 'call', to_match))

        let everyone_has_bet = ins.every(_ => _.bet)
        let all_bets_equal = ins.every(_ => _.bet.total === ins[0].bet.total)
        let bb_has_acted = !ins.find(_ => _.bet.desc === 'bb')
        if (everyone_has_bet && all_bets_equal && bb_has_acted) {
          in_sides.forEach(side => events.all(this.change_state(side, 'p')))
        } else {
          events.all(this.change_state(action_side, 'i'))
          events.all(this.change_state(in_action_next, '@'))
        }
      } break
      case 'raise': {

        let { action, action_side, in_action_next } = this

        let [to_match, to_raise] = args.split('-').map(_ => num(_))
        
        let action_stack = action.stack
        let total_bet = to_match + to_raise

        if (action_stack <= total_bet) {
          events.all(this.post_bet(action_side, 'allin', 
                                   Math.min(action_stack, to_match), 
                                   Math.max(0, Math.min(action_stack - to_match, to_raise))))
          events.all(this.change_state(action_side, 'a'))
        } else {
          events.all(this.post_bet(action_side, 'raise', to_match, to_raise))
          events.all(this.change_state(action_side, 'i'))
        }

        let { in_other_than_action_sides } = this
        if (in_other_than_action_sides.length > 0) {
          events.all(this.change_state(in_action_next, '@'))
        }
      } break
      case 'share': {

        let { shares, have_played_sides } = this


        events.all(this.collect_pot())

        shares.forEach(share => {
          events.all(this.pot_share_stack_add(share))
        })

        have_played_sides.forEach(side => {
          if (this.stacks[side - 1].stack === 0) {
            events.all(this.change_state(side, 'e'))
          } else {
            events.all(this.change_state(side, 'x'))
          }
          events.all(this.collect_card(side))
        })

        this.phase = undefined
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
    case 'fold': {
      let { action_side, in_action_next } = this

      let { in_other_than_actions, in_other_than_action_sides, in_sides } = this

      let everyone_has_bet = in_other_than_actions.every(_ => _.bet)
      let bets_matched = all_equal(in_other_than_actions.map(_ => _.bet?.total))

      if (everyone_has_bet && bets_matched) {
        in_other_than_action_sides.forEach(side => events.all(this.change_state(side, 'p')))
      } else {
        events.all(this.change_state(in_action_next, '@'))
      }

      events.all(this.change_state(action_side, 'f'))
      events.all(this.post_bet(action_side, 'fold'))
    } break
  }

  return events
}

  private pot_share_stack_add(share: PotShare) {

    let { win, back } = share

    if (win) {
      let [side, chips] = win

      this.stacks[side - 1].stack += chips
      
      return new StackAddEvent(side, chips)
    }

    if (back) {
      let [side, chips] = back

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


export class SidePotEvent extends Event {
  constructor(readonly shorts: Side[], readonly chips: Chips) { super() }

  pov(nb: number, pov: Side) {
    return new SidePotEvent(this.shorts.map(side => pov_side(nb, pov, side)), this.chips)
  }

  get fen() {
    return `v ${this.shorts.join('')} ${this.chips}`
  }
}

export class PotAddBet extends Event {
  constructor(readonly side: Side, readonly chips: Chips) { super() }

  pov(nb: number, pov: Side) {
    return new PotAddBet(pov_side(nb, pov, this.side), this.chips)
  }

  get fen() {
    return `p ${this.side} ${this.chips}`
  }
}

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
    return `h ${this.side} ${this.hand.join('')}`
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
