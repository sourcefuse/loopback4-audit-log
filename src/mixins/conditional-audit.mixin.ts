import {DefaultCrudRepository, Entity} from '@loopback/repository';
import {AbstractConstructor, IAuditMixinOptions} from '../types';
import {AuditRepositoryMixin} from './audit.mixin';

/**
 * Apply AuditRepositoryMixin based on flag ADD_AUDIT_LOG_MIXIN
 */

export function ConditionalAuditRepositoryMixin<
  T extends Entity,
  ID,
  Relations extends object,
  S extends AbstractConstructor<DefaultCrudRepository<T, ID, Relations>>,
>(
  constructor: S & AbstractConstructor<DefaultCrudRepository<T, ID, Relations>>,
  opt: IAuditMixinOptions,
): S & AbstractConstructor<DefaultCrudRepository<T, ID, Relations>> {
  const ConditionalRepo =
    process.env.ADD_AUDIT_LOG_MIXIN === 'true'
      ? AuditRepositoryMixin<T, ID, Relations, string, S>(constructor, opt)
      : constructor;
  Object.defineProperty(ConditionalRepo, 'name', {value: constructor.name});
  return ConditionalRepo;
}
