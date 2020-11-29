import {inject} from '@loopback/core';
import {juggler, DefaultCrudRepository} from '@loopback/repository';

import {AuditLog} from '../models';
import {AuditDbSourceName} from '../types';

export class AuditLogRepository extends DefaultCrudRepository<
  AuditLog,
  typeof AuditLog.prototype.id
> {
  constructor(
    @inject(`datasources.${AuditDbSourceName}`) dataSource: juggler.DataSource,
  ) {
    super(AuditLog, dataSource);
  }
}
