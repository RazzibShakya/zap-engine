import { Match, Timer } from "@bhoos/game-kit-engine";
import { Card, generateDeck } from "@bhoos/cards";
import { shuffle } from "@bhoos/utils";
import { Zap, ZapConfig } from "./Zap.js";
import { StartGameAction, ThrowAction, PickAction, FoldAction, FinishGameAction, DealAction, DeclareAction } from "./actions/index.js";
import { ThrowApi, PickApi, DeclareApi } from "./api/index.js";
import { ZAP_STAGE_START, ZAP_STAGE_END, ZAP_STAGE_DEAL } from "./ZapState.js";

export const PICK_TIMER = 2;
export const THROW_TIMER = 1;

export async function ZapLoop(match: Match<Zap>, config: ZapConfig) {
  const state = match.getState();
  const pickTimer = match.createPersistentEvent(() => {
    return Timer.create(state.turn, PICK_TIMER, state.turn, -1);
  });
  const throwTimer = match.createPersistentEvent(() => {
    return Timer.create(state.turn, THROW_TIMER, state.turn, -1);
  });

  // StartGame by distributing cards
  if (state.stage === ZAP_STAGE_START) {
    const players = match.getPlayers();
    match.dispatch(StartGameAction.create(players));
  }

  if (state.stage === ZAP_STAGE_DEAL) {
    const deck = shuffle(generateDeck(1));
    const playerCards = match.getPlayers().map(_ => deck.splice(0, config.dealCards || 5))
    const choiceCard = deck.shift() as Card;
    match.dispatch(DealAction.create(playerCards, deck, choiceCard))
  }

  const fold = (playerIndex: number) => {
    match.dispatch(FoldAction.create(playerIndex));
    const activePlayerIndexes = state.findActivePlayerIndexes();
    if (activePlayerIndexes.length === 1) {
      return activePlayerIndexes[0];
    } else {
      return -1;
    }
  }

  while (state.stage === ZAP_STAGE_END) {
    const player = state.players[state.turnIndex];
    if (player.status === 'throw') {
      await match.wait(throwTimer, ({ expect, onTimeout, on, resolve }) => {
        onTimeout(() => {
          const previousTurnIndex = state.turnIndex;
          const player = state.players[previousTurnIndex];
          match.dispatch(ThrowAction.create(previousTurnIndex, [player.cards[0]]));
          if (player.timeouts === config.timeoutsLimit) {
            return fold(previousTurnIndex);
          }
        });
        if (state.declarer < 0) {
          expect(ThrowApi, ThrowApi.validator, (api) => {
            match.dispatch(ThrowAction.create(api.playerIdx, api.cards));
          })
        }

        expect(DeclareApi, DeclareApi.validate, (api) => {
          match.dispatch(DeclareAction.create(api.cards, api.playerIdx));
        })
      })
    }
    if (state.declarer >= 0) {
      const allPlayerDeclared = state.players.every((val) => val.score > 0)
      if (allPlayerDeclared) {
        let winnerIdx = -1;
        let lowestZapPoint: number | undefined = undefined;
        let scores: number[] = [];
        state.players.forEach((p, idx) => {
          const cardScores = p.cards.reduce((sum, val) => {
            return sum + val.rank.value
          }, 0);
          scores.push(cardScores);
          if (!lowestZapPoint || p.score <= lowestZapPoint) {
            lowestZapPoint = p.score
            winnerIdx = idx;
          }
        })
        match.dispatch(FinishGameAction.create(winnerIdx, scores))
        break;
      }
    }
    if (player.status === 'pick') {
      await match.wait(pickTimer, ({ expect, onTimeout, on, resolve }) => {
        onTimeout(() => {
          const previousTurnIndex = state.turnIndex;
          const player = state.players[previousTurnIndex];
          match.dispatch(PickAction.create(state.deck[0], previousTurnIndex, true));
          if (player.timeouts === config.timeoutsLimit) {
            return fold(previousTurnIndex);
          }
        });
        expect(PickApi, PickApi.validator, (api) => {
          match.dispatch(PickAction.create(api.card, api.playerIdx, api.fromDeck));
        })
      })
    }
  }
  match.end(0);
}