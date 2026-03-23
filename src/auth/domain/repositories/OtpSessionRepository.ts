import { Maybe } from '../../../shared/domain/Maybe';
import { OtpSession } from '../entities/OtpSession';
import { Email } from '../value-objects/Email';

export interface OtpSessionRepository {
  save(session: OtpSession): Promise<void>;
  findByEmail(email: Email): Promise<Maybe<OtpSession>>;
  deleteByEmail(email: Email): Promise<void>;
}

export class InMemoryOtpSessionRepository implements OtpSessionRepository {
  private sessions: Map<string, OtpSession>;

  constructor(initialSessions: OtpSession[] = []) {
    this.sessions = new Map(initialSessions.map((session) => [session.email.value, session]));
  }

  async save(session: OtpSession): Promise<void> {
    this.sessions.set(session.email.value, session);
  }

  async findByEmail(email: Email): Promise<Maybe<OtpSession>> {
    return Maybe.fromNullable(this.sessions.get(email.value));
  }

  async deleteByEmail(email: Email): Promise<void> {
    this.sessions.delete(email.value);
  }
}
