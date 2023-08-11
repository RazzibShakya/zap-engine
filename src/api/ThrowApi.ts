import { Api } from "@bhoos/game-kit-engine";
import { Zap } from "../Zap.js";
import { Serializer, Oracle } from "@bhoos/serialization";
import { Card, serializeCard } from "@bhoos/cards";
import { ZapState } from "../ZapState.js";
import { isCardsSameRank, isSequence } from '../algos/index.js';

export class ThrowApi extends Api<Zap> {
  cards!: Card[];
  playerIdx!: number;

  serialize(serializer: Serializer, oracle: Oracle): void {
    this.cards = serializer.array(this.cards, (res, serializer) => {
      return res = serializeCard(res, serializer);
    })
    this.playerIdx = serializer.int8(this.playerIdx);
  }

  static validator(api: ThrowApi, state: ZapState, playerIndex: number) {
    const player = state.players[playerIndex];
    if (playerIndex != api.playerIdx) throw new Error('The player is not valid');
    if (state.getTurnPlayer().profile.id != player.profile.id) throw new Error('Its not your turn')
    if (!isCardsSameRank(api.cards) || !isSequence(api.cards)) throw new Error('Cards are not valid')
    return true;
  }

  static create(playerIdx: number, cards: Card[]) {
    const k = new ThrowApi();
    k.cards = cards;
    k.playerIdx = playerIdx;
    return k;
  }

}