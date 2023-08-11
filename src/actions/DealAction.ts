import { Action, Client, Match } from "@bhoos/game-kit-engine";
import { Zap, ZapActionConsumer } from "../Zap.js";
import { Serializer, Oracle } from "@bhoos/serialization";
import { Card, serializeCard, serializeCardGroups } from "@bhoos/cards";

export class DealAction extends Action<Zap>{
  cards!: Card[][];
  deck!: Card[];
  choiceCard!: Card;

  serialize(serializer: Serializer, oracle: Oracle): void {
    this.cards = serializeCardGroups(this.cards, serializer);
    this.deck = serializer.array(this.deck, (res, serializer) => {
      return res = serializeCard(res, serializer)
    })
    this.choiceCard = serializeCard(this.choiceCard, serializer);
  }

  personalize(client: Client<Zap>, match: Match<Zap, Client<Zap>>): this {
    const instance = new DealAction();
    const playerIdx = match.getPlayers().findIndex(p => p.id === client.playerId);
    instance.cards = this.cards.map((cards, idx) => {
      return idx === playerIdx ? cards : []
    })
    instance.choiceCard = this.choiceCard;
    return instance as this
  }


  forwardTo<R>(consumer: ZapActionConsumer<R>): R {
    return consumer.onDeal(this)
  }

  static create(cards: Card[][], deck: Card[], choiceCard: Card) {
    const instance = new DealAction();
    instance.cards = cards;
    instance.deck = deck;
    instance.choiceCard = choiceCard;
    return instance
  }
}