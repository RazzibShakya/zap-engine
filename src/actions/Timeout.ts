import { Action } from '@bhoos/game-kit-engine';
import { Zap, ZapActionConsumer } from '../Zap.js';
import { Serializer, Oracle } from '@bhoos/serialization';

export class TimeoutAction extends Action<Zap> {
  serialize(serializer: Serializer, oracle: Oracle): void {

  }

  forwardTo<R>(consumer: ZapActionConsumer<R>): R {
    return consumer.onTimeout(this);
  }

  static create() {
    const k = new TimeoutAction();
    return k;
  }
}