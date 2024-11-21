import {inject} from '@loopback/core';
import {juggler, DefaultCrudRepository, Entity} from '@loopback/repository';
import {AuditLog} from '../models';
import {AuditDbSourceName} from '../types';

export class AuditLogRepository<
  LogModel extends AuditLog = AuditLog,
> extends DefaultCrudRepository<LogModel, typeof AuditLog.prototype.id> {
  constructor(
    @inject(`datasources.${AuditDbSourceName}`) dataSource: juggler.DataSource,
    @inject('models.AuditLog')
    auditLog: typeof Entity & {prototype: LogModel},
  ) {
    super(auditLog, dataSource);
  }
}
