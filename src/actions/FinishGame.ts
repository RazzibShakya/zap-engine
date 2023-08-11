

import { Action, Client, Match } from "@bhoos/game-kit-engine";
import { Serializer, Oracle } from "@bhoos/serialization";
import { Zap, ZapActionConsumer } from "../Zap.js";

export class FinishGameAction extends Action<Zap> {
  winnerIndex!: number;
  scores!: number[];

  personalize(client: Client<Zap>, match: Match<Zap, Client<Zap>>): this {
    return this;
  }

  serialize(serializer: Serializer, oracle: Oracle): void {
    this.winnerIndex = serializer.uint8(this.winnerIndex);
    this.scores = serializer.array(this.scores, (res, serializer) => {
      return res = serializer.int32(res);
    });
  }

  forwardTo<R>(consumer: ZapActionConsumer<R>) {
    return consumer.onFinishGame(this);
  }

  static create(winnerIndex: number, scores: number[]) {
    const k = new FinishGameAction();
    k.winnerIndex = winnerIndex;
    k.scores = scores;
    return k;
  }
}