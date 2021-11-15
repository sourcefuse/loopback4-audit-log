import {LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'test',
  connector: 'memory',
};
export class TestDataSource
  extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'test';
  static readonly defaultConfig = config;

  constructor(dsConfig: object = config) {
    super(dsConfig);
  }
}
