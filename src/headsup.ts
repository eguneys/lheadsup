import { Side, next, RoundN } from './round2'
import { GameN } from './game2'


function make_round_from_game(game: GameN) {
  let { small_blind, button, seats } = game
  return RoundN.make(small_blind, button, seats.map(seat => seat.chips))
}

export class Headsup {

  static make = () => {

    let small_blind = 10
    let game = GameN.headsup(small_blind)

    let stacks = small_blind * 300

    game.act(`sit 1-${stacks}`)
    game.act(`sit 2-${stacks}`)

    return new Headsup([], game)
  }

  constructor(
    readonly history: RoundN[],
    public game?: GameN,
    public round?: RoundN,
    public winner?: Side) {}

  get game_dests() {
    let { dests } = this.game!

    dests.lea = undefined
    dests.folds = undefined

    return dests
  }

  get round_dests() {
    return this.round?.dests
  }

  round_act(act: string) {
    let res = this.round!.act(act)

    let { dests } = this.round!

    if (dests.phase || !dests.dealer_action) {
      if (this.history.length === 10) {
        this.history.shift()
      }
      this.history.push(RoundN.from_fen(this.round!.fen))
    }

   
    if (dests.fin) {
      let lose_side = this.round!.stacks.findIndex(_ => _.stack === 0) + 1
      if (lose_side !== 0) {
        this.round = undefined
        this.game = undefined
        this.winner = next(2, lose_side as Side)
      } else {
        let shares = this.round!.stacks.map(_ => _.stack).join('-')
        this.round = undefined

        return this.game!.act(`share ${shares}`)
      }
    }

    return res
  }

  game_act(act: string) {

    let [cmd, args] = act.split(' ')

    switch (cmd) {
      case 'deal': {
        this.round = make_round_from_game(this.game!)
        return this.game!.act(act)
      }
    }
  }
}
