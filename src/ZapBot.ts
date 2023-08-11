import { Action, Client, Event, Match, Timer } from "@bhoos/game-kit-engine";
import { Zap, ZapState } from "./index.js";
import { Card } from "@bhoos/cards";
import { shuffle } from "@bhoos/utils";
// import { orderCardsInValidWay } from "./logic/isValidCardOrdering.js";
// import { PLAY_TIMER } from "./ZapLoop.js";
// import { SubmitApi } from "./apis/SubmitApi.js";



export class ZapBot implements Client<Zap> {
  playerId: string;
  state: ZapState;
  match: Match<Zap>;

  constructor(playerId: string, match: Match<Zap>) {
    this.playerId = playerId;
    this.state = match.getState();
    this.match = match;
  }

  end(code: number): void {

  }

  dispatch(action: Action<Zap>): void {

  }

  emit(event: Event<Zap>): void {
    
  }


}
