import { Api } from "@bhoos/game-kit-engine";
import { Zap } from "../Zap.js";
import { Serializer, Oracle } from "@bhoos/serialization";
import { ZapState } from "../ZapState.js";
import { Card, serializeCard } from "@bhoos/cards";

export class PickApi extends Api<Zap> {
  playerIdx!: number;
  card!: Card;
  fromDeck!: boolean

  serialize(serializer: Serializer, oracle: Oracle): void {
    this.playerIdx = serializer.uint8(this.playerIdx);
    this.card = serializeCard(this.card, serializer);
    this.fromDeck = serializer.bool(this.fromDeck);
  }

  static validator(api: PickApi, state: ZapState, playerIdx: number) {
    // const choices = state.throwCards[state.throwCards.length - 2];
    // if (api.card != Card.Back && !choices.includes(api.card)) {
    //   throw new Error(`Card Picked ${api.card} is from invalid sournce ${choices}`);
    // }
    return true;
  }

  static create(card: Card, playerIdx: number, fromDeck: boolean) {
    const k = new PickApi();
    k.card = card;
    k.playerIdx = playerIdx;
    k.fromDeck = fromDeck;
    return k;
  }

}