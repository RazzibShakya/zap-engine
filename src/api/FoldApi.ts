import { Api } from "@bhoos/game-kit-engine";
import { Zap } from "../Zap.js";
import { Serializer, Oracle } from "@bhoos/serialization";
import { ZapState } from "../ZapState.js";

export class FoldApi extends Api<Zap> {
  playerIdx!: number;
  serialize(serializer: Serializer, oracle: Oracle): void {
    this.playerIdx = serializer.uint8(this.playerIdx);
  }

  static create(playerIdx: number) {
    const k = new FoldApi();
    k.playerIdx = playerIdx;
    return k;
  }

  static validate(api: FoldApi, state: ZapState, playerIndex: number) {
    const player = state.players[playerIndex];
    if (player.folded) throw new Error('Player has already folded');
    return playerIndex;
  }
}