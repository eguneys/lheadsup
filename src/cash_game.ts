import { ValidGameN } from './vgame'

export class CashGame {

  static nine = (small_blind: number) => {
    let min_buyin = small_blind * 100
    let game = GameN.nine(small_blind)

    return new CashGame(min_buyin, game)
  }

  static six = (small_blind: number) => {
    let min_buyin = small_blind * 100
    let game = GameN.six(small_blind)

    return new CashGame(min_buyin, game)
  }

  static three = (small_blind: number) => {
    let min_buyin = small_blind * 100
    let game = GameN.three(small_blind)
    return new CashGame(min_buyin, game)
  }

  static headsup = (small_blind: number) => {
    let min_buyin = small_blind * 100
    let game = GameN.headsup(small_blind)

    return new CashGame(min_buyin, game)
  }

  constructor(
    readonly min_buyin: Chips,
    readonly game: ValidGameN) {}

  get max_buyin() {
    return this.min_buyin * 5
  }
}
