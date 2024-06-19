import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {TestAuditLog} from '../models/audit.model';
import {inject} from '@loopback/core';

export class TestAuditLogRepository extends DefaultCrudRepository<
  TestAuditLog,
  typeof TestAuditLog.prototype.id,
  {}
> {
  constructor(@inject('datasources.AuditDB') dataSource: juggler.DataSource) {
    super(TestAuditLog, dataSource);
  }
}
