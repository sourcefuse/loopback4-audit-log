// Copyright (c) 2023 Sourcefuse Technologies
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {TenantUtilitiesBindings} from '@sourceloop/core';
import * as path from 'path';
import {TestRepository} from './repositories/test.repository';
import {AuditLogRepository} from '../../../repositories';
import {TestAuditLogErrorRepository} from './repositories/audit-error.repository';
import {TestErrorRepository} from './repositories/test-error.repository';
import {AuditLogComponent} from '../../../component';

export {ApplicationConfig};

export class DummyAuditServiceApplication extends BootMixin(
  RepositoryMixin(RestApplication),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);
    this.static('/', path.join(__dirname, '../public'));

    this.bind(TenantUtilitiesBindings.Config).to({
      useSingleTenant: true,
    });

    this.component(AuditLogComponent);

    this.repository(AuditLogRepository);
    this.repository(TestRepository);
    this.repository(TestAuditLogErrorRepository);
    this.repository(TestErrorRepository);
    this.projectRoot = __dirname;
    this.bootOptions = {
      controllers: {
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
}
