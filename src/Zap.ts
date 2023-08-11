import { EventConsumer, Game } from "@bhoos/game-kit-engine";
import { } from "./actions/index.js";
import { ZapState } from './ZapState.js';
import { StartGameAction, ThrowAction, PickAction, RedoDeckAction, FinishGameAction, TimeoutAction, FoldAction } from "./actions/index.js";
import { DealAction } from "./actions/DealAction.js";
import { DeclareAction } from "./actions/DeclareAction.js";

export type ZapPlayer = {
  id: string;
  name: string;
  picture: string;
}

export interface ZapActionConsumer<Return> {
  onStartGame(action: StartGameAction): Return;
  onDeal(action: DealAction): Return;
  onThrow(action: ThrowAction): Return;
  onPick(action: PickAction): Return;
  onFinishGame(action: FinishGameAction): Return;
  onRedoDeck(action: RedoDeckAction): Return;
  onFold(action: FoldAction): Return;
  onTimeout(action: TimeoutAction): Return;
  onDeclare(action: DeclareAction): Return;
}

export interface ZapEventConsumer extends EventConsumer {

}


export type Zap = Game<ZapActionConsumer<never>, ZapState, ZapEventConsumer, ZapPlayer>;

export type ZapConfig = {
  dealCards: number,
  matchTimer: number,
  turnTimer: number,
  zapThreshold: number,
  timeoutsLimit: number,
  minFoldPenalty: number,
}

export const DefaultZapConfig: ZapConfig = {
  dealCards: 5,
  matchTimer: 99999999,
  turnTimer: 100000,
  zapThreshold: 10,
  timeoutsLimit: 3,
  minFoldPenalty: 25,
}


