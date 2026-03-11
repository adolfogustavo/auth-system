import { Collection, Db } from 'mongodb';
import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { Id } from '../../../shared/domain/value-objects/Id';
import { Email } from '../../domain/value-objects/Email';
import { Maybe } from '../../../shared/domain/Maybe';

interface UserDocument {
  _id: string;
  id: string;
}

export class MongoUserRepository implements UserRepository {
  private collection: Collection<UserDocument>;

  constructor(db: Db) {
    this.collection = db.collection<UserDocument>('users');
  }

  async save(user: User): Promise<void> {
    const primitives = user.toPrimitives();
    await this.collection.updateOne({ _id: primitives.email }, { $set: { id: primitives.id } }, { upsert: true });
  }

  async findByEmail(email: Email): Promise<Maybe<User>> {
    const document = await this.collection.findOne({
      _id: email.toPrimitives(),
    });
    return Maybe.fromNullable(document).map((doc) => this.toDomain(doc));
  }

  private toDomain(document: UserDocument): User {
    return User.create(Id.create(document.id), Email.create(document._id));
  }
}
