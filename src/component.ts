import {Component, CoreBindings, ProviderMap, inject} from '@loopback/core';
import {Class, Model} from '@loopback/repository';
import {AuditLog} from './models';
import {AuditLog as TenantAuditLog} from './models/tenant-support';
import {
  ITenantUtilitiesConfig,
  TenantUtilitiesBindings,
  TenantUtilitiesComponent,
} from '@sourceloop/core';
import {RestApplication} from '@loopback/rest';

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
    } else {
      this.models = [TenantAuditLog];
    }
  }
  providers?: ProviderMap = {};
  models?: Class<Model>[];
}
