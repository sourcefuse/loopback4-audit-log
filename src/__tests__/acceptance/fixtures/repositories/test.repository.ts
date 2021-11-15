import {Constructor, Getter} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {TestDataSource} from '../datasources/test.datasource';
import {TestModel, TestModelRelations} from '../models/test.model';
import {IAuthUser} from 'loopback4-authentication';
import {AuditRepositoryMixin, IAuditMixinOptions} from '../../../..';
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
    public getCurrentUser: Getter<IAuthUser>,
    public getAuditLogRepository: Getter<TestAuditLogRepository>,
  ) {
    super(TestModel, dataSource);
  }
}
