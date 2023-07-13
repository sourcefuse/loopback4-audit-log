import {Constructor, Getter} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';

import {
  ActorId,
  AuditRepositoryMixin,
  IAuditMixinOptions,
  User,
} from '../../../..';
import {TestDataSource} from '../datasources/test.datasource';
import {TestModel, TestModelRelations} from '../models/test.model';
import {TestAuditLogRepository} from './audit.repository';

export const testAuditOpts: IAuditMixinOptions = {
  actionKey: 'Item_Logs',
};

export class TestRepository extends AuditRepositoryMixin<
  TestModel,
  typeof TestModel.prototype.id,
  TestModelRelations,
  number | string,
  Constructor<
    DefaultCrudRepository<
      TestModel,
      typeof TestModel.prototype.id,
      TestModelRelations
    >
  >
>(DefaultCrudRepository, testAuditOpts) {
  constructor(
    dataSource: TestDataSource,
    public getCurrentUser: Getter<User>,
    public getAuditLogRepository: Getter<TestAuditLogRepository>,
    public actorIdKey?: ActorId,
  ) {
    super(TestModel, dataSource);
  }
}
