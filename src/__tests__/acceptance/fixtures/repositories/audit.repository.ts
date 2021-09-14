import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {TestAuditLog} from '../models/audit.model';

export class TestAuditLogRepository extends DefaultCrudRepository<
  TestAuditLog,
  typeof TestAuditLog.prototype.id
> {
  constructor(dataSource: juggler.DataSource) {
    super(TestAuditLog, dataSource);
  }
}
