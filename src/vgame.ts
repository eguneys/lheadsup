import { make_deal } from './cards'
import { GameN } from './game2'
import { Side, num, RoundN } from './round2'

export function make_round_from_game(game: GameN) {

  let { small_blind, button, seats } = game

  return RoundN.make(small_blind, button, seats.map(seat => seat.chips))
}

export class ValidGameN {

  constructor(
    readonly game: GameN,
    public round?: RoundN) {}

  get game_dests() {
    return this.game.dests
  }

  get round_dests() {
    return this.round?.dests
  }

  dealer_round() {
    let { round } = this

    if (!round) {
      return undefined
    }

    let { dests } = round

    if (dests.deal) {
      return round.act(`deal ${make_deal(dests.deal)}`)
    } else if (dests.phase) {
      return round.act('phase')
    } else if (dests.showdown) {
      return round.act('showdown')
    } else if (dests.share) {
      return round.act('share')
    } else if (dests.win) {
      return round.act('win')
    }
  }

  action_round(side: Side, act: string) {
    let { round } = this

    if (!round) {
      return undefined
    }

    let { dests, action_side } = round

    if (side !== action_side) {
      return undefined
    }

    if (dests.check && act === 'check') {
      return round.act('check')
    }
    if (dests.fold && act === 'fold') {
      return round.act('fold')
    }
    if (dests.call && act === `call ${dests.call.match}`) {
      return round.act(act)
    }
    if (dests.raise) {
      let [cmd, args] = act.split(' ')
      if (cmd === 'raise') {
        let [to_match, to_raise] = args.split('-').map(_ => num(_))
        let action_stack = round.action.stack

        if (to_match > 0 && to_raise >= 0) {

          if (to_match < dests.raise.match) {
            if (to_match === action_stack) {
              return round.act(act)
            }
          } else if (to_match === dests.raise.match) {
            if (to_raise < dests.raise.min_raise) {
              if (to_raise === action_stack - to_match) {
                return round.act(act)
              }
            } else if (to_raise <= action_stack - to_match) {
              return round.act(act)
            }
          }
        }
      }
    }
  }


  dealer_game() {
    let { dests } = this.game

    let round = this.round!

    if (dests.deal) {
      this.round = make_round_from_game(this.game)
      return this.game.act('deal')
    }

    if (dests.share) {
      if (round.dests.fin) {
        let shares = round.stacks.map(_ => _.stack).join('-')
        this.round = undefined
        return this.game.act(`share ${shares}`)
      }
    }
  }

  action_game(act: string) {
    let { dests } = this.game

    let [cmd, args] = act.split(' ')
    if (dests.sit && cmd === 'sit') {
      let [side, prechecked_chips] = args.split('-')

      if (dests.sit.includes(num(side) as Side)) {
        return this.game.act(cmd)
      }
    }
    if (dests.lea && cmd === 'lea') {

      if (dests.lea.includes(num(args) as Side)) {
        return this.game.act(cmd)
      }
    }
    if (dests.folds && cmd === 'fold') {
      if (dests.folds.includes(num(args) as Side)) {
        return this.game.act(cmd)
      }
    }
    if (dests.nexts && cmd === 'next') {
      if (dests.nexts.includes(num(args) as Side)) {
        return this.game.act(cmd)
      }
    }
    if (dests.js && cmd === 'in') {
      if (dests.js.includes(num(args) as Side)) {
        return this.game.act(cmd)
      }
    }
  }
}
