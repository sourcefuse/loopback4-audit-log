import {inject} from '@loopback/core';
import {AuditLog} from '../../models';
import {AuditDbSourceName} from '../../types';
import {
  SequelizeCrudRepository,
  SequelizeDataSource,
} from '@loopback/sequelize';

export class AuditLogRepository extends SequelizeCrudRepository<
  AuditLog,
  typeof AuditLog.prototype.id
> {
  constructor(
    @inject(`datasources.${AuditDbSourceName}`) dataSource: SequelizeDataSource,
  ) {
    super(AuditLog, dataSource);
  }
}
