import {LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
import {AuditDbSourceName} from '../../../../types';

const config = {
  name: 'testAudit',
  connector: 'memory',
};

export class TestAuditDataSource
  extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = AuditDbSourceName;
  static readonly defaultConfig = config;

  constructor(dsConfig: object = config) {
    super(dsConfig);
  }
}
