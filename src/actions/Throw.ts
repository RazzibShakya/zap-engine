import { Action, Client, Match } from "@bhoos/game-kit-engine";
import { Serializer, Oracle } from "@bhoos/serialization";
import { Zap, ZapActionConsumer } from "../Zap.js";
import { Card, serializeCard } from "@bhoos/cards";

export class ThrowAction extends Action<Zap> {
  cards!: Card[];
  playerIdx!: number

  personalize(client: Client<Zap>, match: Match<Zap, Client<Zap>>): this {
    return this;
  }

  serialize(serializer: Serializer, oracle: Oracle): void {
    this.cards = serializer.array(this.cards, (res, serializer) => {
      return res = serializeCard(res, serializer);
    })
    this.playerIdx = serializer.uint8(this.playerIdx);
  }

  forwardTo<R>(consumer: ZapActionConsumer<R>): R {
    return consumer.onThrow(this);
  }

  static create(playerIdx: number, cards: Card[]) {
    const k = new ThrowAction();
    k.cards = cards;
    k.playerIdx = playerIdx;
    return k;
  }
}