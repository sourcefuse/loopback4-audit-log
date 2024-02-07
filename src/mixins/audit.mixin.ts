import {
  AnyObject,
  Count,
  DataObject,
  Entity,
  Where,
} from '@loopback/repository';
import {cloneDeep, isArray, keyBy} from 'lodash';
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

    createAuditLog(
      user: User,
      entity: M,
      action: Action,
      modification: {before?: AnyObject; after?: AnyObject},
      options?: AuditOptions,
    ): AuditLog {
      const {before, after} = modification;
      const extras: Omit<IAuditMixinOptions, 'actionKey'> = {...opts};
      delete extras.actionKey;
      return new AuditLog({
        actedAt: new Date(),
        actor: this.getActor(user, options?.actorId),
        action,
        before,
        after,
        entityId: entity.getId(),
        actedOn: this.entityClass.modelName,
        actionKey: opts.actionKey,
        tenantId: user.tenantId,
        ...extras,
      });
    }

    async createAuditEntry(
      auditData: AuditLog | Array<AuditLog>,
    ): Promise<void> {
      const auditRepo = await this.getAuditLogRepository();
      if (isArray(auditData)) {
        auditRepo.createAll(auditData).catch(() => {
          const auditsJson = auditData.map(a => a.toJSON());
          const errorMessage = `Audit failed for data => ${JSON.stringify(
            auditsJson,
          )}`;
          console.error(errorMessage); // NOSONAR - Unexpected console statement
        });
      } else {
        auditRepo.create(auditData).catch(() => {
          const errorMessage = `Audit failed for data => ${JSON.stringify(
            auditData.toJSON(),
          )}`;
          console.error(errorMessage); // NOSONAR - Unexpected console statement
        });
      }
    }

    async create(
      dataObject: DataObject<M>,
      options?: AuditOptions,
    ): Promise<M> {
      const created = await super.create(dataObject, options);
      if (this.getCurrentUser && !options?.noAudit) {
        const user = await this.getCurrentUser();
        const audit = this.createAuditLog(
          user,
          created,
          Action.INSERT_ONE,
          {after: created.toJSON()},
          options,
        );
        await this.createAuditEntry(audit);
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
        const audits = created.map(data =>
          this.createAuditLog(
            user,
            data,
            Action.INSERT_MANY,
            {after: data.toJSON()},
            options,
          ),
        );

        await this.createAuditEntry(audits);
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
        const audits = updated.map(data =>
          this.createAuditLog(
            user,
            data,
            Action.UPDATE_MANY,
            {
              before: (beforeMap[data.getId()] as Entity).toJSON(),
              after: data.toJSON(),
            },
            options,
          ),
        );

        await this.createAuditEntry(audits);
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
        const audits = toDelete.map(data =>
          this.createAuditLog(
            user,
            data,
            Action.DELETE_MANY,
            {before: (beforeMap[data.getId()] as Entity).toJSON()},
            options,
          ),
        );

        await this.createAuditEntry(audits);
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
        const auditLog = this.createAuditLog(
          user,
          before,
          Action.UPDATE_ONE,
          {before: before.toJSON(), after: after.toJSON()},
          options,
        );

        await this.createAuditEntry(auditLog);
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
        const auditLog = this.createAuditLog(
          user,
          before,
          Action.UPDATE_ONE,
          {before: before.toJSON(), after: after.toJSON()},
          options,
        );

        await this.createAuditEntry(auditLog);
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
        const auditLog = this.createAuditLog(
          user,
          before,
          Action.DELETE_ONE,
          {before: before.toJSON()},
          options,
        );

        await this.createAuditEntry(auditLog);
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
        const audits = toDelete.map(data =>
          this.createAuditLog(
            user,
            data,
            Action.DELETE_MANY,
            {before: (beforeMap[data.getId()] as Entity).toJSON()},
            options,
          ),
        );

        await this.createAuditEntry(audits);
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
        const auditLog = this.createAuditLog(
          user,
          before,
          Action.DELETE_ONE,
          {before: before.toJSON()},
          options,
        );

        await this.createAuditEntry(auditLog);
      }
    }
    getActor(user: User, optionsActorId?: string): string {
      return optionsActorId ?? user[this.actorIdKey ?? 'id']?.toString() ?? '0';
    }
  }
  return MixedRepository;
}
