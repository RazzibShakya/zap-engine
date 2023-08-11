import { Action } from "@bhoos/game-kit-engine";
import { Serializer, Oracle } from "@bhoos/serialization";
import { Zap, ZapActionConsumer } from "../Zap.js";

export class FoldAction extends Action<Zap> {
  playerIndex!: number;

  serialize(serializer: Serializer, oracle: Oracle): void {
    throw new Error("Method not implemented.");
  }

  forwardTo<R>(consumer: ZapActionConsumer<R>): R {
    return consumer.onFold(this);
  }

  static create(playerIndex: number) {
    const k = new FoldAction();
    k.playerIndex = playerIndex;
    return k;
  }
}