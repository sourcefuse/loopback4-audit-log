import {Component, CoreBindings, ProviderMap, inject} from '@loopback/core';
import {Class, Model, Repository} from '@loopback/repository';
import {AuditLog} from './models';
import {AuditLog as TenantAuditLog} from './models/tenant-support';
import {
  ITenantUtilitiesConfig,
  TenantUtilitiesBindings,
  TenantUtilitiesComponent,
  tenantGuard,
} from '@sourceloop/core';
import {RestApplication} from '@loopback/rest';
import {AuditLogRepository} from './repositories';

export class AuditLogComponent implements Component {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private readonly application: RestApplication,
    @inject(TenantUtilitiesBindings.Config, {optional: true})
    private readonly config?: ITenantUtilitiesConfig,
  ) {
    this.application.component(TenantUtilitiesComponent);
    if (this.config?.useSingleTenant) {
      this.models = [AuditLog];
      this.repositories = [AuditLogRepository<AuditLog>];
    } else {
      this.models = [TenantAuditLog];
      this.repositories = [tenantGuard()(AuditLogRepository<TenantAuditLog>)];
    }
  }
  providers?: ProviderMap = {};
  /**
   * An optional list of Model classes to bind for dependency injection
   * via `app.model()` API.
   */
  models?: Class<Model>[];
  /**
   * An optional list of Repository classes to bind for dependency injection
   * via `app.repository()` API.
   */
  repositories?: Class<Repository<Model>>[]; //define repositories
}
