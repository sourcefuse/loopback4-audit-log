import {Constructor, Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, repository} from '@loopback/repository';
import {
  AuditLogRepository,
  AuditRepositoryMixin,
  IAuditMixinOptions,
} from '../../../..';
import {TestDataSource} from '../datasources/test.datasource';
import {TestModel, TestModelRelations} from '../models/test.model';
import {IAuthUserWithPermissions} from '@sourceloop/core';

export const testAuditOpts: IAuditMixinOptions = {
  actionKey: 'Item_Logs',
};
export class TestErrorRepository extends AuditRepositoryMixin<
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
    @inject('datasources.test') dataSource: TestDataSource,
    @inject.getter('sf.userAuthentication.currentUser')
    public getCurrentUser: Getter<IAuthUserWithPermissions>,
    @repository.getter('TestAuditLogErrorRepository')
    public getAuditLogRepository: Getter<AuditLogRepository>,
  ) {
    super(TestModel, dataSource);
  }
}
