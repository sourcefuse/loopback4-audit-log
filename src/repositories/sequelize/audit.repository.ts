import {inject} from '@loopback/core';
import {AuditLog} from '../../models/tenant-support';
import {AuditDbSourceName} from '../../types';
import {
  SequelizeCrudRepository,
  SequelizeDataSource,
} from '@loopback/sequelize';
import {Entity} from '@loopback/repository';
import {tenantGuard} from '@sourceloop/core';

@tenantGuard()
export class AuditLogRepository extends SequelizeCrudRepository<
  AuditLog,
  typeof AuditLog.prototype.id
> {
  constructor(
    @inject(`datasources.${AuditDbSourceName}`) dataSource: SequelizeDataSource,
    @inject('models.AuditLog')
    private readonly auditLog: typeof Entity & {prototype: AuditLog},
  ) {
    super(auditLog, dataSource);
  }
}
