import {Constructor, MixinTarget} from '@loopback/core';
import {
  Count,
  DataObject,
  Entity,
  EntityCrudRepository,
  Where,
} from '@loopback/repository';
import {keyBy, cloneDeep} from 'lodash';

import {Action, AuditLog} from '../models';
import {AuditLogRepository} from '../repositories';
import {AuditOptions, IAuditMixin, IAuditMixinOptions} from '../types';

//sonarignore:start
export function AuditRepositoryMixin<
  M extends Entity,
  ID,
  Relations extends object,
  UserID,
  //sonarignore:end
  R extends MixinTarget<EntityCrudRepository<M, ID, Relations>>,
>(
  superClass: R,
  opts: IAuditMixinOptions,
): R & Constructor<IAuditMixin<UserID>> {
  class MixedRepository extends superClass implements IAuditMixin<UserID> {
    getAuditLogRepository: () => Promise<AuditLogRepository>;
    getCurrentUser?: () => Promise<{id?: UserID}>;

    /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
    // @ts-ignore
    async create(
      dataObject: DataObject<M>,
      options?: AuditOptions,
    ): Promise<M> {
      const created = await super.create(dataObject, options);
      if (this.getCurrentUser && !options?.noAudit) {
        const user = await this.getCurrentUser();
        const auditRepo = await this.getAuditLogRepository();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const extras: any = Object.assign({}, opts); //NOSONAR
        delete extras.actionKey;
        const audit = new AuditLog({
          actedAt: new Date(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          actor: (user?.id as any)?.toString() ?? '0', //NOSONAR
          action: Action.INSERT_ONE,
          after: created.toJSON(),
          entityId: created.getId(),
          actedOn: this.entityClass.modelName,
          actionKey: opts.actionKey,
          ...extras,
        });

        auditRepo.create(audit).catch(() => {
          //sonarignore:start
          console.error(
            `Audit failed for data => ${JSON.stringify(audit.toJSON())}`,
          );
          //sonarignore:end
        });
      }
      return created;
    }

    /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
    // @ts-ignore
    async createAll(
      dataObjects: DataObject<M>[],
      options?: AuditOptions,
    ): Promise<M[]> {
      const created = await super.createAll(dataObjects, options);
      if (this.getCurrentUser && !options?.noAudit) {
        const user = await this.getCurrentUser();
        const auditRepo = await this.getAuditLogRepository();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const extras: any = Object.assign({}, opts); //NOSONAR
        delete extras.actionKey;
        const audits = created.map(
          data =>
            new AuditLog({
              actedAt: new Date(),
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              actor: (user?.id as any).toString() ?? '0', //NOSONAR
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
          //sonarignore:start
          console.error(
            `Audit failed for data => ${JSON.stringify(auditsJson)}`,
          );
          //sonarignore:end
        });
      }
      return created;
    }

    /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
    // @ts-ignore
    async updateAll(
      dataObject: DataObject<M>,
      where?: Where<M>,
      options?: AuditOptions,
    ): Promise<Count> {
      if (options?.noAudit) {
        return super.updateAll(dataObject, where, options);
      }
      const toUpdate = await this.find({where});
      const beforeMap = keyBy(toUpdate, d => d.getId());
      const updatedCount = await super.updateAll(dataObject, where, options);
      const updated = await this.find({where});

      if (this.getCurrentUser) {
        const user = await this.getCurrentUser();
        const auditRepo = await this.getAuditLogRepository();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const extras: any = Object.assign({}, opts); //NOSONAR
        delete extras.actionKey;
        const audits = updated.map(
          data =>
            new AuditLog({
              actedAt: new Date(),
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              actor: (user?.id as any).toString() ?? '0', //NOSONAR
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
          //sonarignore:start
          console.error(
            `Audit failed for data => ${JSON.stringify(auditsJson)}`,
          );
          //sonarignore:end
        });
      }

      return updatedCount;
    }

    /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
    // @ts-ignore
    async deleteAll(where?: Where<M>, options?: AuditOptions): Promise<Count> {
      if (options?.noAudit) {
        return super.deleteAll(where, options);
      }
      const toDelete = await this.find({where});
      const beforeMap = keyBy(toDelete, d => d.getId());
      const deletedCount = await super.deleteAll(where, options);

      if (this.getCurrentUser) {
        const user = await this.getCurrentUser();
        const auditRepo = await this.getAuditLogRepository();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const extras: any = Object.assign({}, opts); //NOSONAR
        delete extras.actionKey;
        const audits = toDelete.map(
          data =>
            new AuditLog({
              actedAt: new Date(),
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              actor: (user?.id as any).toString() ?? '0', //NOSONAR
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
          //sonarignore:start
          console.error(
            `Audit failed for data => ${JSON.stringify(auditsJson)}`,
          );
          //sonarignore:end
        });
      }

      return deletedCount;
    }

    /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
    // @ts-ignore
    async updateById(
      id: ID,
      data: DataObject<M>,
      options?: AuditOptions,
    ): Promise<void> {
      if (options?.noAudit) {
        return super.updateById(id, data, options);
      }
      const before = await this.findById(id);
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const extras: any = Object.assign({}, opts); //NOSONAR
        delete extras.actionKey;
        const auditLog = new AuditLog({
          actedAt: new Date(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          actor: (user?.id as any).toString() ?? '0', //NOSONAR
          action: Action.UPDATE_ONE,
          before: before.toJSON(),
          after: after.toJSON(),
          entityId: before.getId(),
          actedOn: this.entityClass.modelName,
          actionKey: opts.actionKey,
          ...extras,
        });

        auditRepo.create(auditLog).catch(() => {
          //sonarignore:start
          console.error(
            `Audit failed for data => ${JSON.stringify(auditLog.toJSON())}`,
          );
          //sonarignore:end
        });
      }
    }

    /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
    // @ts-ignore
    async replaceById(
      id: ID,
      data: DataObject<M>,
      options?: AuditOptions,
    ): Promise<void> {
      if (options?.noAudit) {
        return super.replaceById(id, data, options);
      }
      const before = await this.findById(id);
      await super.replaceById(id, data, options);
      const after = await this.findById(id);

      if (this.getCurrentUser) {
        const user = await this.getCurrentUser();
        const auditRepo = await this.getAuditLogRepository();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const extras: any = Object.assign({}, opts); //NOSONAR
        delete extras.actionKey;
        const auditLog = new AuditLog({
          actedAt: new Date(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          actor: (user?.id as any).toString() ?? '0', //NOSONAR
          action: Action.UPDATE_ONE,
          before: before.toJSON(),
          after: after.toJSON(),
          entityId: before.getId(),
          actedOn: this.entityClass.modelName,
          actionKey: opts.actionKey,
          ...extras,
        });

        auditRepo.create(auditLog).catch(() => {
          //sonarignore:start
          console.error(
            `Audit failed for data => ${JSON.stringify(auditLog.toJSON())}`,
          );
          //sonarignore:end
        });
      }
    }

    /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
    // @ts-ignore
    async deleteById(id: ID, options?: AuditOptions): Promise<void> {
      if (options?.noAudit) {
        return super.deleteById(id, options);
      }
      const before = await this.findById(id);
      await super.deleteById(id, options);

      if (this.getCurrentUser) {
        const user = await this.getCurrentUser();
        const auditRepo = await this.getAuditLogRepository();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const extras: any = Object.assign({}, opts); //NOSONAR
        delete extras.actionKey;
        const auditLog = new AuditLog({
          actedAt: new Date(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          actor: (user?.id as any).toString() ?? '0', //NOSONAR
          action: Action.DELETE_ONE,
          before: before.toJSON(),
          entityId: before.getId(),
          actedOn: this.entityClass.modelName,
          actionKey: opts.actionKey,
          ...extras,
        });

        auditRepo.create(auditLog).catch(() => {
          //sonarignore:start
          console.error(
            `Audit failed for data => ${JSON.stringify(auditLog.toJSON())}`,
          );
          //sonarignore:end
        });
      }
    }
  }
  return MixedRepository;
}
