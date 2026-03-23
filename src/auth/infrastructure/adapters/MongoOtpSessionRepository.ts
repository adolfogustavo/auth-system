import { Collection, Db } from 'mongodb';
import { OtpSession } from '../../domain/entities/OtpSession';
import { OtpSessionRepository } from '../../domain/repositories/OtpSessionRepository';
import { Email } from '../../domain/value-objects/Email';
import { Maybe } from '../../../shared/domain/Maybe';

interface OtpSessionDocument {
  _id: string;
  otp: string;
  expiresAt: string;
  failedAttempts: number;
  lockedUntil: string | null;
}

export class MongoOtpSessionRepository implements OtpSessionRepository {
  private collection: Collection<OtpSessionDocument>;

  constructor(db: Db) {
    this.collection = db.collection<OtpSessionDocument>('otp_sessions');
  }

  async save(session: OtpSession): Promise<void> {
    const document = this.toDocument(session);
    await this.collection.updateOne({ _id: document._id }, { $set: document }, { upsert: true });
  }

  async findByEmail(email: Email): Promise<Maybe<OtpSession>> {
    const document = await this.collection.findOne({ _id: email.value });
    return Maybe.fromNullable(document).map((doc) => this.toDomain(doc));
  }

  async deleteByEmail(email: Email): Promise<void> {
    await this.collection.deleteOne({ _id: email.value });
  }

  private toDocument(session: OtpSession): OtpSessionDocument {
    const primitives = session.toPrimitives();
    return {
      _id: primitives.email,
      otp: primitives.otp,
      expiresAt: primitives.expiresAt,
      failedAttempts: primitives.failedAttempts,
      lockedUntil: primitives.lockedUntil,
    };
  }

  private toDomain(document: OtpSessionDocument): OtpSession {
    return OtpSession.fromPrimitives({
      email: document._id,
      otp: document.otp,
      expiresAt: document.expiresAt,
      failedAttempts: document.failedAttempts,
      lockedUntil: document.lockedUntil,
    });
  }
}
