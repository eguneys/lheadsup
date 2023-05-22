import { make_deal } from './cards'
import { GameN } from './game2'
import { RoundN } from './round2'

export class ValidGameN {


  constructor(
    readonly game: GameN,
    readonly round?: RoundN) {}


  dealer_round() {
    let { dests } = this.round

    if (dests.deal) {
      return this.round.act(`deal ${make_deal(dests.deal)}`)
    } else if (dests.phase) {
      return this.round.act('phase')
    } else if (dests.showdown) {
      return this.round.act('showdown')
    } else if (dests.share) {
      return this.round.act('share')
    } else if (dests.win) {
      return this.round.act('win')
    }
  }

  action_round(act: string) {
    let { dests } = this.round

    if (dests.check && act === 'check') {
      return this.round.act('check')
    }
    if (dests.fold && act === 'fold') {
      return this.round.act('fold')
    }
    if (dests.call && act === `call ${dests.call.match}`) {
      return this.round.act(act)
    }
    if (dests.raise) {
      let [cmd, args] = act.split(' ')
      if (cmd === 'raise') {
        let [to_match, to_raise] = args.split('-').map(_ => num(_))
        let action_stack = this.round.action.stack

        if (to_match > 0 && to_raise >= 0) {

          if (to_match < dests.raise.match) {
            if (to_match === action_stack) {
              return this.round.act(act)
            }
          } else if (to_match === dests.raise.match) {
            if (to_raise < dests.raise.min_raise) {
              if (to_raise === action_stack - to_match) {
                return this.round.act(act)
              }
            } else if (to_raise <= action_stack - to_match) {
              return this.round.act(act)
            }
          }
        }
      }
    }
  }


  dealer_game() {
    let { dests } = this.game

    if (dests.deal) {
      this.round = RoundN.from_game(this.game)
      return this.game.act('deal')
    }

    if (dests.share) {
      if (this.round.dests.fin) {
        let shares = this.round.stacks.map(_ => _.chips).join('-')
        this.round = undefined
        return this.game.act(`share ${shares}`)
      }
    }
  }

  action_game(act: string) {
    let { dests } = this.game


  }
}
