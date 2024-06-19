import {Constructor, Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, repository} from '@loopback/repository';
import {TestDataSource} from '../datasources/test.datasource';
import {TestModel, TestModelRelations} from '../models/test.model';
import {IAuthUserWithPermissions} from '@sourceloop/core';
import {AuditRepositoryMixin} from '../../../../mixins';
import {IAuditMixinOptions} from '../../../../types';
import {AuditLogRepository} from '../../../../repositories';
import {TestAuditLog} from '../models/audit.model';
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
  >,
  TestAuditLog,
  TestAuditLogRepository
>(DefaultCrudRepository, testAuditOpts) {
  constructor(
    @inject('datasources.test') dataSource: TestDataSource,
    @inject.getter('sf.userAuthentication.currentUser')
    public getCurrentUser: Getter<IAuthUserWithPermissions>,
    @repository.getter('TestAuditLogRepository')
    public getAuditLogRepository: Getter<AuditLogRepository>,
  ) {
    super(TestModel, dataSource);
  }
}
