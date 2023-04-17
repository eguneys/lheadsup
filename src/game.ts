import { next, Round, Chips, Side } from './round'


export type GameAction = string

export class Game {

  static make = () => {

    let small_blind = 10
    let button: Side = 1
    let stacks: [Chips, Chips] = [small_blind * 100, small_blind * 100]

    return new Game(small_blind, button, stacks, undefined)
  }

  constructor(
    public small_blind: Chips,
    public button: Side,
    public stacks: [Chips, Chips],
    public deal?: true) {}

  get big_blind() {
    return this.small_blind * 2
  }

  get fen() {

    let { small_blind, big_blind, button } = this

    let blinds = [small_blind, big_blind].join('-')
    let blinds_button = [blinds, button].join(' ')
    let stacks = this.stacks.join(' ')

    if (this.deal) {
      return [blinds_button, stacks, '@'].join(' / ')
    } else {
      return [blinds_button, stacks].join(' / ')
    }
  }


  get dests() {
    if (this.deal) {
      return 'dist'
    } else {
      return 'deal'
    }
  }


  act(action: GameAction, dist?: Round) {
    switch (action) {
      case 'deal': {

        this.deal = true

        return Round.from_game(this)
      } break
      case 'dist': {
        this.deal = undefined

        let { win, show, back } = dist!.distribution!


        if (win) {
          let [side, chips] = win
          let stacks: [Chips, Chips] = [...dist!.stacks]
          stacks[side - 1] += chips

          this.stacks = stacks

          this.button = next(this.button)
        }

      } break
    }
  }

  blinds(blinds: Chips) {
    this.small_blind = blinds
  }

}
