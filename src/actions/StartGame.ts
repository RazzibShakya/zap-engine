import { Action, Client, Match } from "@bhoos/game-kit-engine";
import { Serializer, Oracle } from "@bhoos/serialization";
import { Zap, ZapActionConsumer, ZapPlayer } from "../Zap.js";

export class StartGameAction extends Action<Zap> {
  players!: ZapPlayer[];
  userIdx!: number;

  serialize(serializer: Serializer, oracle: Oracle): void {
    this.players = serializer.array(this.players, (res, serializer) => {
      return res = serializer.obj(res, (p) => {
        p.name = serializer.string(p.name);
        p.id = serializer.string(p.id);
        p.picture = serializer.string(p.picture)
      })
    })
    this.userIdx = serializer.int8(this.userIdx);
  }

  personalize(client: Client<Zap>, match: Match<Zap, Client<Zap>>): this {
    const instance = new StartGameAction();
    instance.userIdx = this.players.findIndex((p) => p.id === client.playerId);
    return instance as this
  }

  forwardTo<R>(consumer: ZapActionConsumer<R>) {
    return consumer.onStartGame(this);
  }

  static create(players: ZapPlayer[]) {
    const k = new StartGameAction();
    k.players = players;
    return k;
  }
}