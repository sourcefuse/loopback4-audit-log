import {inject} from '@loopback/core';
import {juggler, DefaultCrudRepository, Entity} from '@loopback/repository';

import {AuditLog} from '../models/tenant-support';
import {AuditDbSourceName} from '../types';
import {tenantGuard} from '@sourceloop/core';

@tenantGuard()
export class AuditLogRepository extends DefaultCrudRepository<
  AuditLog,
  typeof AuditLog.prototype.id
> {
  constructor(
    @inject(`datasources.${AuditDbSourceName}`) dataSource: juggler.DataSource,
    @inject('models.AuditLog')
    private readonly auditLog: typeof Entity & {prototype: AuditLog},
  ) {
    super(auditLog, dataSource);
  }
}
