import { OtpSession } from '../entities/OtpSession';
import { Email } from '../value-objects/Email';
import { Maybe } from '../../../shared/domain/Maybe';

export interface OtpSessionRepository {
  save(session: OtpSession): Promise<void>;
  findByEmail(email: Email): Promise<Maybe<OtpSession>>;
  deleteByEmail(email: Email): Promise<void>;
}

export class InMemoryOtpSessionRepository implements OtpSessionRepository {
  private sessions: Map<string, OtpSession> = new Map();

  constructor(initialSessions: OtpSession[] = []) {
    initialSessions.forEach((session) => {
      const primitives = session.toPrimitives();
      this.sessions.set(primitives.email, session);
    });
  }

  async save(session: OtpSession): Promise<void> {
    const primitives = session.toPrimitives();
    this.sessions.set(primitives.email, session);
  }

  async findByEmail(email: Email): Promise<Maybe<OtpSession>> {
    return Maybe.fromNullable(this.sessions.get(email.toPrimitives()));
  }

  async deleteByEmail(email: Email): Promise<void> {
    this.sessions.delete(email.toPrimitives());
  }
}
