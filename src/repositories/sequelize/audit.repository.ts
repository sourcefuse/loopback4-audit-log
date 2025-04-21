import {inject} from '@loopback/core';
import {AuditDbSourceName} from '../../types';
import {
  SequelizeCrudRepository,
  SequelizeDataSource,
} from '@loopback/sequelize';
import {Entity} from '@loopback/repository';
import {AuditLog} from '../../models';

export class AuditLogRepository<
  LogModel extends AuditLog = AuditLog,
> extends SequelizeCrudRepository<LogModel, typeof AuditLog.prototype.id> {
  constructor(
    @inject(`datasources.${AuditDbSourceName}`) dataSource: SequelizeDataSource,
    @inject('models.AuditLog')
    auditLog: typeof Entity & {prototype: LogModel},
  ) {
    super(auditLog, dataSource);
  }
}
