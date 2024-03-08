import {DefaultCrudRepository, Entity, juggler} from '@loopback/repository';
import {TestAuditLog} from '../models/audit.model';
import {tenantGuard} from '@sourceloop/core';
import {inject} from '@loopback/core';

@tenantGuard()
export class TestAuditLogRepository extends DefaultCrudRepository<
  TestAuditLog,
  typeof TestAuditLog.prototype.id
> {
  constructor(
    @inject('datasources.AuditDB') dataSource: juggler.DataSource,
    @inject('models.AuditLog')
    private readonly auditLog: typeof Entity & {prototype: TestAuditLog},
  ) {
    super(auditLog, dataSource);
  }
}
