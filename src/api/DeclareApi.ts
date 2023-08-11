import { Api } from "@bhoos/game-kit-engine";
import { Zap } from "../Zap.js";
import { Serializer, Oracle } from "@bhoos/serialization";
import { Card, serializeCard } from "@bhoos/cards";
import { ZapState } from "../ZapState.js";

export class DeclareApi extends Api<Zap> {
  cards!: Card[];
  playerIdx!: number;

  serialize(serializer: Serializer, oracle: Oracle): void {
    this.cards = serializer.array(this.cards, (res, serializer) => {
      return res = serializeCard(res, serializer)
    })
    this.playerIdx = serializer.uint8(this.playerIdx);
  }

  static create(cards: Card[], playerIdx: number) {
    const k = new DeclareApi();
    k.cards = cards;
    k.playerIdx = playerIdx;
    return k;
  }

  static validate(api: DeclareApi, state: ZapState, playerIndex: number) {
    const player = state.players[playerIndex];
    if (player.folded) throw new Error('Player has already folded');
    if (playerIndex != state.turnIndex) {
      throw new Error('Can be declared only on your own turn.');
    }
    const value = player.cards.reduce((sum, card) => sum + card.rank.value, 0);
    if (value > 5) {
      throw new Error(`Cannot declare - cards value too high. Required: ${5}, provided: ${value}`);
    };
    return playerIndex;
  }
}

