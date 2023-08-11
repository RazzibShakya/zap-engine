import { Card } from "@bhoos/cards";
import { ZapActionConsumer, ZapPlayer } from "./Zap.js";
import { StartGameAction, ThrowAction, PickAction, RedoDeckAction, FinishGameAction, TimeoutAction, FoldAction } from "./actions/index.js";
import { DealAction } from "./actions/DealAction.js";
import { DeclareAction } from "./actions/DeclareAction.js";

export const ZAP_STAGE_START = 1;
export const ZAP_STAGE_DEAL = 2;
export const ZAP_STAGE_PLAY = 3;
export const ZAP_STAGE_END = 4;

export type ZAP_STAGE =
  | typeof ZAP_STAGE_START
  | typeof ZAP_STAGE_DEAL
  | typeof ZAP_STAGE_PLAY
  | typeof ZAP_STAGE_END


export type PlayerState = {
  profile: ZapPlayer;
  cards: Card[];
  folded: boolean;
  status: 'pick' | 'throw' | 'normal'
  timeouts: number;
  score: number
}

export type ZapSummary = {
  winnerIdx: number;
  scores: number[];
}

export function nextTurnValue(state: ZapState, playerIdx: number) {
  const currentTurn = state.turn % state.players.length;
  const increment = (playerIdx + state.players.length) - currentTurn;
  return state.turn + increment;
}

export class ZapState implements ZapActionConsumer<void> {
  stage: ZAP_STAGE = ZAP_STAGE_START;
  players: PlayerState[] = [];
  userIdx: number
  deck: Card[] = [];
  choiceCard: Card | null = null;
  thrownCards: Card[][] = [];
  declarer: number = -1;
  turn = -1;
  summary: ZapSummary = {
    winnerIdx: -1,
    scores: []
  }

  onDeclare(action: DeclareAction): void {
    if (this.declarer < 0) {
      this.declarer = action.playerIdx;
    }
    this.players.forEach((p, idx) => {
      p.score = p.cards.reduce((sum, c) => {
        return sum + c.rank.value;
      }, 0)
    })
  }

  onDeal(action: DealAction): void {
    this.stage = ZAP_STAGE_PLAY;
    this.players.forEach((p, idx) => {
      p.cards = action.cards[idx]
    })
    this.choiceCard = action.choiceCard;
    this.deck = action.deck;
    this.turn = nextTurnValue(this, 0);
  }

  onStartGame(action: StartGameAction): void {
    this.players = action.players.map((p) => {
      return {
        profile: {
          id: p.id,
          name: p.name,
          picture: p.picture
        },
        score: 0,
        cards: [],
        folded: false,
        timeouts: 0,
        status: 'normal'
      }
    })
    this.stage = ZAP_STAGE_DEAL;
    this.userIdx = action.userIdx;
  }

  onThrow(action: ThrowAction) {
    const player = this.players[action.playerIdx];
    player.status = 'pick'
    if (player.cards.length != 0) {
      player.cards = player.cards.filter((card1) => {
        action.cards.forEach((card2) => {
          return card1.code != card2.code
        })
      })
    }
    this.thrownCards.push(action.cards);
  }

  onPick(action: PickAction) {
    const player = this.players[action.playerIdx];
    player.cards.push(action.card);
    player.status = 'normal';
    if (action.fromDeck) {
      this.deck.pop()
    } else {
      if (this.turn === 0) {
        this.choiceCard = null
      } else {
        this.thrownCards[this.thrownCards.length - 1] = this.thrownCards[this.thrownCards.length - 1].filter((card) => {
          return !card.is(action.card)
        })
      }
    }
    this._nextTurn()
  }

  onRedoDeck(action: RedoDeckAction): void {
    // const throwCards = this.throwCards.pop()!;
    // this.deck = shuffle(this.throwCards.flat());
    // this.throwCards = [throwCards];
  }

  onFinishGame(action: FinishGameAction) {
    this.summary.winnerIdx = action.winnerIndex;
    this.summary.scores = action.scores
  }

  onTimeout(action: TimeoutAction) {
    const player = this.getTurnPlayer();
    player.timeouts += 1;
    this._nextTurn();
  }

  onFold(action: FoldAction) {
    this.players[action.playerIndex].folded = true;
    // If the player folding is the current player, move to next turn
    if (this.turnIndex === action.playerIndex) {
      this._nextTurn();
    }
  }

  getTurnPlayer() {
    const player = this.players[this.turn % this.players.length];
    return player;
  }

  get emptyDeck() {
    return this.deck.length == 0;
  }

  findActivePlayerIndexes() {
    return this.players.reduce((res, player, idx) => {
      if (!player.folded) {
        res.push(idx);
      }
      return res;
    }, [] as number[]);
  }

  private _nextTurn() {
    do {
      this.turn += 1;
    } while (!this.players[this.turn % this.players.length].folded);
  }

  get turnIndex() {
    return this.turn % this.players.length;
  }

  getScores(declarer: number) {
    const values: number[] = this.players.map((player, index) => {
      const value = player.cards.reduce((sum, card) => sum + card.rank.value, 0);
      return player.folded ? Math.max(0, value) : value;
    });
    const declaration = values[declarer];

    // number of active (not-folded) players
    const active = this.players.reduce((count, p) => count + (p.folded ? 0 : 1), 0);

    values[declarer] = Number.MAX_VALUE;
    const min = Math.min(...values);

    values[declarer] = 0;
    const total = values.reduce((sum, value) => sum + value, 0);

    if (declaration < min || active === 1) {
      values.forEach((n, i) => values[i] = -1 * n);
      values[declarer] = total;
    } else { // UTLO PARYO
      const winner = [...values, ...values].indexOf(min, declarer) % values.length;
      values.fill(0);
      values[declarer] = -2 * total;
      values[winner] = 2 * total;
    }

    return values;
  }

}
