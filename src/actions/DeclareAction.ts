import { Action, Client, Match } from "@bhoos/game-kit-engine";
import { Zap, ZapActionConsumer } from "../Zap.js";
import { Serializer, Oracle } from "@bhoos/serialization";
import { Card, serializeCard } from "@bhoos/cards";

export class DeclareAction extends Action<Zap>{
  cards!: Card[];
  playerIdx!: number;

  personalize(client: Client<Zap>, match: Match<Zap, Client<Zap>>): this {
    return this;
  }

  serialize(serializer: Serializer, oracle: Oracle): void {
    this.cards = serializer.array(this.cards, (res, serializer) => {
      return res = serializeCard(res, serializer)
    })
    this.playerIdx = serializer.uint8(this.playerIdx);
  }

  forwardTo<R>(consumer: ZapActionConsumer<R>) {
    return consumer.onDeclare(this);
  }

  static create(cards: Card[], playerIdx: number) {
    const instance = new DeclareAction();
    instance.cards = cards;
    instance.playerIdx = playerIdx;
    return instance
  }
}
