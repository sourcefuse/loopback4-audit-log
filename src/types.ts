import {AuditLogRepository} from './repositories';
import {AuditLogRepository as SequelizeAuditLogRepository} from './repositories/sequelize';
import {
  Count,
  DataObject,
  Entity,
  Filter,
  FilterExcludingWhere,
  Options,
  Where,
} from '@loopback/repository';

export const AuditDbSourceName = 'AuditDB';
export interface IAuditMixin<UserID> {
  getAuditLogRepository: () => Promise<
    AuditLogRepository | SequelizeAuditLogRepository
  >;
  getCurrentUser?: () => Promise<{id?: UserID}>;
}

export interface IAuditMixinOptions {
  actionKey: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; //NOSONAR
}
export interface AuditLogOption {
  noAudit: boolean;
}
export declare type AuditOptions = Options & AuditLogOption;

export type AbstractConstructor<T> = abstract new (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
) => T;

export type MixinBaseClass<T> = AbstractConstructor<T>;

export type AuditMixinBase<T extends Entity, ID, Relations> = MixinBaseClass<{
  entityClass: typeof Entity & {
    prototype: T;
  };
  find(filter?: Filter<T>, options?: Options): Promise<(T & Relations)[]>;
  findById(
    id: ID,
    filter?: FilterExcludingWhere<T>,
    options?: Options,
  ): Promise<T & Relations>;
  create(entity: DataObject<T>, options?: Options): Promise<T>;
  createAll(entities: DataObject<T>[], options?: Options): Promise<T[]>;
  update(entity: T, options?: Options): Promise<void>;
  delete(entity: T, options?: Options): Promise<void>;
  updateAll(
    data: DataObject<T>,
    where?: Where<T>,
    options?: Options,
  ): Promise<Count>;
  updateById(id: ID, data: DataObject<T>, options?: Options): Promise<void>;
  replaceById(id: ID, data: DataObject<T>, options?: Options): Promise<void>;
  deleteAll(where?: Where<T>, options?: Options): Promise<Count>;
  deleteById(id: ID, options?: Options): Promise<void>;
}>;
