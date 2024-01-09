import {Count, DataObject, Entity, Where} from '@loopback/repository';
import {cloneDeep, keyBy} from 'lodash';
import {Action, AuditLog} from '../models';
import {AuditLogRepository} from '../repositories';
import {AuditLogRepository as SequelizeAuditLogRepository} from '../repositories/sequelize';
import {
  AbstractConstructor,
  ActorId,
  AuditMixinBase,
  AuditOptions,
  IAuditMixin,
  IAuditMixinOptions,
  User,
} from '../types';

// NOSONAR -  ignore camelCase naming convention
export function AuditRepositoryMixin<
  M extends Entity,
  ID,
  Relations extends object,
  UserID,
  R extends AuditMixinBase<M, ID, Relations>,
>(
  superClass: R,
  opts: IAuditMixinOptions,
): R & AbstractConstructor<IAuditMixin<UserID>> {
  abstract class MixedRepository
    extends superClass
    implements IAuditMixin<UserID>
  {
    getAuditLogRepository: () => Promise<
      AuditLogRepository | SequelizeAuditLogRepository
    >;
    getCurrentUser?: () => Promise<User>;
    actorIdKey?: ActorId;

    async create(
      dataObject: DataObject<M>,
      options?: AuditOptions,
    ): Promise<M> {
      const created = await super.create(dataObject, options);
      if (this.getCurrentUser && !options?.noAudit) {
        const user = await this.getCurrentUser();
        const auditRepo = await this.getAuditLogRepository();
        const extras: Omit<IAuditMixinOptions, 'actionKey'> = {...opts};
        delete extras.actionKey;
        const audit = new AuditLog({
          actedAt: new Date(),
          actor: this.getActor(user, options?.actorId),
          action: Action.INSERT_ONE,
          after: created.toJSON(),
          entityId: created.getId(),
          actedOn: this.entityClass.modelName,
          actionKey: opts.actionKey,
          ...extras,
        });

        auditRepo.create(audit).catch(() => {
          const errorMessage = `Audit failed for data => ${JSON.stringify(
            audit.toJSON(),
          )}`;
          console.error(errorMessage); // NOSONAR - Unexpected console statement
        });
      }
      return created;
    }

    async createAll(
      dataObjects: DataObject<M>[],
      options?: AuditOptions,
    ): Promise<M[]> {
      const created = await super.createAll(dataObjects, options);
      if (this.getCurrentUser && !options?.noAudit) {
        const user = await this.getCurrentUser();
        const auditRepo = await this.getAuditLogRepository();
        const extras: Omit<IAuditMixinOptions, 'actionKey'> = {...opts};
        delete extras.actionKey;
        const audits = created.map(
          data =>
            new AuditLog({
              actedAt: new Date(),
              actor: this.getActor(user, options?.actorId),
              action: Action.INSERT_MANY,
              after: data.toJSON(),
              entityId: data.getId(),
              actedOn: this.entityClass.modelName,
              actionKey: opts.actionKey,
              ...extras,
            }),
        );
        auditRepo.createAll(audits).catch(() => {
          const auditsJson = audits.map(a => a.toJSON());
          const errorMessage = `Audit failed for data => ${JSON.stringify(
            auditsJson,
          )}`;
          console.error(errorMessage); // NOSONAR - Unexpected console statement
        });
      }
      return created;
    }

    async updateAll(
      dataObject: DataObject<M>,
      where?: Where<M>,
      options?: AuditOptions,
    ): Promise<Count> {
      if (options?.noAudit) {
        return super.updateAll(dataObject, where, options);
      }
      const toUpdate = await this.find({where}, options);
      const beforeMap = keyBy(toUpdate, d => d.getId());
      const updatedCount = await super.updateAll(dataObject, where, options);
      const updated = await this.find({where}, options);

      if (this.getCurrentUser) {
        const user = await this.getCurrentUser();
        const auditRepo = await this.getAuditLogRepository();
        const extras: Omit<IAuditMixinOptions, 'actionKey'> = {...opts};
        delete extras.actionKey;
        const audits = updated.map(
          data =>
            new AuditLog({
              actedAt: new Date(),
              actor: this.getActor(user, options?.actorId),
              action: Action.UPDATE_MANY,
              before: (beforeMap[data.getId()] as Entity).toJSON(),
              after: data.toJSON(),
              entityId: data.getId(),
              actedOn: this.entityClass.modelName,
              actionKey: opts.actionKey,
              ...extras,
            }),
        );
        auditRepo.createAll(audits).catch(() => {
          const auditsJson = audits.map(a => a.toJSON());
          const errorMessage = `Audit failed for data => ${JSON.stringify(
            auditsJson,
          )}`;
          console.error(errorMessage); // NOSONAR - Unexpected console statement
        });
      }

      return updatedCount;
    }

    async deleteAll(where?: Where<M>, options?: AuditOptions): Promise<Count> {
      if (options?.noAudit) {
        return super.deleteAll(where, options);
      }
      const toDelete = await this.find({where}, options);
      const beforeMap = keyBy(toDelete, d => d.getId());
      const deletedCount = await super.deleteAll(where, options);

      if (this.getCurrentUser) {
        const user = await this.getCurrentUser();
        const auditRepo = await this.getAuditLogRepository();
        const extras: Omit<IAuditMixinOptions, 'actionKey'> = {...opts};
        delete extras.actionKey;
        const audits = toDelete.map(
          data =>
            new AuditLog({
              actedAt: new Date(),
              actor: this.getActor(user, options?.actorId),
              action: Action.DELETE_MANY,
              before: (beforeMap[data.getId()] as Entity).toJSON(),
              entityId: data.getId(),
              actedOn: this.entityClass.modelName,
              actionKey: opts.actionKey,
              ...extras,
            }),
        );
        auditRepo.createAll(audits).catch(() => {
          const auditsJson = audits.map(a => a.toJSON());
          const errorMessage = `Audit failed for data => ${JSON.stringify(
            auditsJson,
          )}`;
          console.error(errorMessage); // NOSONAR - Unexpected console statement
        });
      }

      return deletedCount;
    }

    async updateById(
      id: ID,
      data: DataObject<M>,
      options?: AuditOptions,
    ): Promise<void> {
      if (options?.noAudit) {
        return super.updateById(id, data, options);
      }
      const before = await this.findById(id, undefined, options);
      // loopback repository internally calls updateAll so we don't want to create another log
      if (options) {
        options.noAudit = true;
      } else {
        options = {noAudit: true};
      }
      await super.updateById(id, data, options);
      let after = cloneDeep(before);
      after = Object.assign(after, data);

      if (this.getCurrentUser) {
        const user = await this.getCurrentUser();
        const auditRepo = await this.getAuditLogRepository();
        const extras: Omit<IAuditMixinOptions, 'actionKey'> = {...opts};
        delete extras.actionKey;
        const auditLog = new AuditLog({
          actedAt: new Date(),
          actor: this.getActor(user, options?.actorId),
          action: Action.UPDATE_ONE,
          before: before.toJSON(),
          after: after.toJSON(),
          entityId: before.getId(),
          actedOn: this.entityClass.modelName,
          actionKey: opts.actionKey,
          ...extras,
        });

        auditRepo.create(auditLog).catch(() => {
          const errorMessage = `Audit failed for data => ${JSON.stringify(
            auditLog.toJSON(),
          )}`;
          console.error(errorMessage); // NOSONAR - Unexpected console statement
        });
      }
    }

    async replaceById(
      id: ID,
      data: DataObject<M>,
      options?: AuditOptions,
    ): Promise<void> {
      if (options?.noAudit) {
        return super.replaceById(id, data, options);
      }
      const before = await this.findById(id, undefined, options);
      await super.replaceById(id, data, options);
      const after = await this.findById(id, undefined, options);

      if (this.getCurrentUser) {
        const user = await this.getCurrentUser();
        const auditRepo = await this.getAuditLogRepository();
        const extras: Omit<IAuditMixinOptions, 'actionKey'> = {...opts};
        delete extras.actionKey;
        const auditLog = new AuditLog({
          actedAt: new Date(),
          actor: this.getActor(user, options?.actorId),
          action: Action.UPDATE_ONE,
          before: before.toJSON(),
          after: after.toJSON(),
          entityId: before.getId(),
          actedOn: this.entityClass.modelName,
          actionKey: opts.actionKey,
          ...extras,
        });

        auditRepo.create(auditLog).catch(() => {
          const errorMessage = `Audit failed for data => ${JSON.stringify(
            auditLog.toJSON(),
          )}`;
          console.error(errorMessage); // NOSONAR - Unexpected console statement
        });
      }
    }

    async deleteById(id: ID, options?: AuditOptions): Promise<void> {
      if (options?.noAudit) {
        return super.deleteById(id, options);
      }
      const before = await this.findById(id, undefined, options);
      await super.deleteById(id, options);

      if (this.getCurrentUser) {
        const user = await this.getCurrentUser();
        const auditRepo = await this.getAuditLogRepository();
        const extras: Omit<IAuditMixinOptions, 'actionKey'> = {...opts};
        delete extras.actionKey;
        const auditLog = new AuditLog({
          actedAt: new Date(),
          actor: this.getActor(user, options?.actorId),
          action: Action.DELETE_ONE,
          before: before.toJSON(),
          entityId: before.getId(),
          actedOn: this.entityClass.modelName,
          actionKey: opts.actionKey,
          ...extras,
        });

        auditRepo.create(auditLog).catch(() => {
          const errorMessage = `Audit failed for data => ${JSON.stringify(
            auditLog.toJSON(),
          )}`;
          console.error(errorMessage); // NOSONAR - Unexpected console statement
        });
      }
    }
    async deleteAllHard(
      where?: Where<M>,
      options?: AuditOptions,
    ): Promise<Count> {
      if (!super.deleteAllHard) {
        throw new Error('Method not Found');
      }
      if (options?.noAudit) {
        return super.deleteAllHard(where, options);
      }
      const toDelete = await this.find({where}, options);
      const beforeMap = keyBy(toDelete, d => d.getId());
      const deletedCount = await super.deleteAllHard(where, options);

      if (this.getCurrentUser) {
        const user = await this.getCurrentUser();
        const auditRepo = await this.getAuditLogRepository();
        const extras: Omit<IAuditMixinOptions, 'actionKey'> = {...opts};
        delete extras.actionKey;
        const audits = toDelete.map(
          data =>
            new AuditLog({
              actedAt: new Date(),
              actor: this.getActor(user, options?.actorId),
              action: Action.DELETE_MANY,
              before: (beforeMap[data.getId()] as Entity).toJSON(),
              entityId: data.getId(),
              actedOn: this.entityClass.modelName,
              actionKey: opts.actionKey,
              ...extras,
            }),
        );
        auditRepo.createAll(audits).catch(() => {
          const auditsJson = audits.map(a => a.toJSON());
          const errorMessage = `Audit failed for data => ${JSON.stringify(
            auditsJson,
          )}`;
          console.error(errorMessage); // NOSONAR - Unexpected console statement
        });
      }
      return deletedCount;
    }

    async deleteByIdHard(id: ID, options?: AuditOptions): Promise<void> {
      if (!super.deleteByIdHard) {
        throw new Error('Method not Found');
      }
      if (options?.noAudit) {
        return super.deleteByIdHard(id, options);
      }
      const before = await this.findById(id, undefined, options);
      await super.deleteByIdHard(id, options);

      if (this.getCurrentUser) {
        const user = await this.getCurrentUser();
        const auditRepo = await this.getAuditLogRepository();
        const extras: Omit<IAuditMixinOptions, 'actionKey'> = {...opts};
        delete extras.actionKey;
        const auditLog = new AuditLog({
          actedAt: new Date(),
          actor: this.getActor(user, options?.actorId),
          action: Action.DELETE_ONE,
          before: before.toJSON(),
          entityId: before.getId(),
          actedOn: this.entityClass.modelName,
          actionKey: opts.actionKey,
          ...extras,
        });

        auditRepo.create(auditLog).catch(() => {
          const errorMessage = `Audit failed for data => ${JSON.stringify(
            auditLog.toJSON(),
          )}`;
          console.error(errorMessage); // NOSONAR - Unexpected console statement
        });
      }
    }
    getActor(user: User, optionsActorId?: string): string {
      return optionsActorId ?? user[this.actorIdKey ?? 'id']?.toString() ?? '0';
    }
  }
  return MixedRepository;
}
