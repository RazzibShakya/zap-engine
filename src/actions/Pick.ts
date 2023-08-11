import { Action, Client, Match } from "@bhoos/game-kit-engine";
import { Zap, ZapActionConsumer } from "../Zap.js";
import { Serializer, Oracle } from "@bhoos/serialization";
import { Card, serializeCard } from "@bhoos/cards";

export class PickAction extends Action<Zap> {
  card!: Card;
  playerIdx!: number;
  fromDeck!: boolean

  personalize(client: Client<Zap>, match: Match<Zap, Client<Zap>>): this {
    const instance = new PickAction();
    const playerIdx = match.getPlayers().findIndex(p => p.id === client.playerId);
    if (this.playerIdx === playerIdx || !this.fromDeck) {
      instance.card = this.card
    } else {
      instance.card = Card.Back;
    }
    instance.playerIdx = this.playerIdx;
    instance.fromDeck = this.fromDeck;
    return instance as this;
  }

  serialize(serializer: Serializer, oracle: Oracle): void {
    this.card = serializeCard(this.card, serializer);
    this.playerIdx = serializer.uint8(this.playerIdx);
    this.fromDeck = serializer.bool(this.fromDeck);
  }

  forwardTo<R>(consumer: ZapActionConsumer<R>): R {
    return consumer.onPick(this);
  }

  static create(card: Card, playerIdx: number, fromDeck: boolean) {
    const k = new PickAction();
    k.card = card;
    k.playerIdx = playerIdx;
    k.fromDeck = fromDeck;
    return k;
  }
}