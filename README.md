# @sourceloop/audit-log

[![LoopBack](<https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png>)](http://loopback.io/)

A loopback-next extension for implementing audit logs in loopback applications for all DB transactions.This extension provides a generic model to store audit data, which can be backed by any datasource you want.

## Install

```sh
npm install @sourceloop/audit-log
```

## Usage

In order to use this component into your LoopBack application, please follow below steps.

- Add audit model class as Entity.

```ts
import {Entity, model, property} from '@loopback/repository';
import {Action} from '@sourceloop/audit-log';

@model({
  name: 'audit_logs',
  settings: {
    strict: false,
  },
})
export class AuditLog extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  action: Action;

  @property({
    name: 'acted_at',
    type: 'date',
    required: true,
  })
  actedAt: Date;

  @property({
    name: 'acted_on',
    type: 'string',
  })
  actedOn?: string;

  @property({
    name: 'action_key',
    type: 'string',
    required: true,
  })
  actionKey: string;

  @property({
    name: 'entity_id',
    type: 'string',
    required: true,
  })
  entityId: string;

  @property({
    type: 'string',
    required: true,
  })
  actor: string;

  @property({
    type: 'object',
  })
  before?: object;

  @property({
    type: 'object',
  })
  after?: object;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<AuditLog>) {
    super(data);
  }
}
```

- Using `lb4 datasource` command create your own datasource using your preferred connector. Here is an example of datasource using postgres connector. Notice the statement `static dataSourceName = AuditDbSourceName;`. Make sure you change the data source name as per this in order to ensure connection work from extension.

```ts
import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
import {AuditDbSourceName} from '@sourceloop/audit-log';

const config = {
  name: 'audit',
  connector: 'postgresql',
  url: '',
  host: '',
  port: 0,
  user: '',
  password: '',
  database: '',
};

@lifeCycleObserver('datasource')
export class AuditDataSource
  extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = AuditDbSourceName;
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.audit', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
```

- Using `lb4 repository` command, create a repository file. After that, change the inject paramater as below so as to refer to correct data source name.
  `@inject(`datasources.\${AuditDbSourceName}`) dataSource: AuditDataSource,`

One example below.

```ts
import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {AuditDbSourceName} from '@sourceloop/audit-log';

import {AuditDataSource} from '../datasources';
import {AuditLog} from '../models';

export class AuditLogRepository extends DefaultCrudRepository<
  AuditLog,
  typeof AuditLog.prototype.id
> {
  constructor(
    @inject(`datasources.${AuditDbSourceName}`) dataSource: AuditDataSource,
  ) {
    super(AuditLog, dataSource);
  }
}
```

- The component exposes a mixin for your repository classes. Just extend your repository class with `AuditRepositoryMixin`, for all those repositories where you need audit data. See an example below. For a model `Group`, here we are extending the `GroupRepository` with `AuditRepositoryMixin`.

```ts
import {repository} from '@loopback/repository';
import {Group, GroupRelations} from '../models';
import {PgdbDataSource} from '../datasources';
import {inject, Getter, Constructor} from '@loopback/core';
import {AuthenticationBindings, IAuthUser} from 'loopback4-authentication';
import {AuditRepositoryMixin} from '@sourceloop/audit-log';
import {AuditLogRepository} from './audit-log.repository';

const groupAuditOpts: IAuditMixinOptions = {
  actionKey: 'Group_Logs',
};

export class GroupRepository extends AuditRepositoryMixin<
  Group,
  typeof Group.prototype.id,
  GroupRelations,
  string,
  Constructor<
    DefaultCrudRepository<Group, typeof Group.prototype.id, GroupRelations>
  >
>(DefaultCrudRepository, groupAuditOpts) {
  constructor(
    @inject('datasources.pgdb') dataSource: PgdbDataSource,
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    public getCurrentUser: Getter<IAuthUser>,
    @repository.getter('AuditLogRepository')
    public getAuditLogRepository: Getter<AuditLogRepository>,
  ) {
    super(Group, dataSource, getCurrentUser);
  }
}
```

You can pass any extra attributes to save into audit table using the `IAuditMixinOptions` parameter of mixin function.

Make sure you provide `getCurrentUser` and `getAuditLogRepository` Getter functions in constructor.

This will create all insert, update, delete audits for this model.

## Feedback

If you've noticed a bug or have a question or have a feature request, [search the issue tracker](https://github.com/sourcefuse/loopback4-audit-log/issues) to see if someone else in the community has already created a ticket.
If not, go ahead and [make one](https://github.com/sourcefuse/loopback4-audit-log/issues/new/choose)!
All feature requests are welcome. Implementation time may vary. Feel free to contribute the same, if you can.
If you think this extension is useful, please [star](https://help.github.com/en/articles/about-stars) it. Appreciation really helps in keeping this project alive.

## Contributing

Please read [CONTRIBUTING.md](https://github.com/sourcefuse/loopback4-audit-log/blob/master/.github/CONTRIBUTING.md) for details on the process for submitting pull requests to us.

## Code of conduct

Code of conduct guidelines [here](https://github.com/sourcefuse/loopback4-audit-log/blob/master/.github/CODE_OF_CONDUCT.md).

## License

[MIT](https://github.com/sourcefuse/loopback4-audit-log/blob/master/LICENSE)
