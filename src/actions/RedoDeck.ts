import { Action } from "@bhoos/game-kit-engine";
import { Oracle, Serializer } from "@bhoos/serialization";
import { Zap, ZapActionConsumer } from "../Zap.js";

export class RedoDeckAction extends Action<Zap> {
  serialize(serializer: Serializer, oracle: Oracle): void {
    throw new Error("Method not implemented.");
  }

  forwardTo<R>(consumer: ZapActionConsumer<R>): R {
    return consumer.onRedoDeck(this);
  }

  static create() {
    return new RedoDeckAction();
  }
}