import {Entity} from '@loopback/repository';
import {AuditMixinBase, IAuditMixinOptions} from '../types';
import {AuditRepositoryMixin} from './audit.mixin';

/**
 * Apply AuditRepositoryMixin based on flag ADD_AUDIT_LOG_MIXIN
 */

// NOSONAR -  ignore camelCase naming convention
export function ConditionalAuditRepositoryMixin<
  T extends Entity,
  ID,
  Relations extends object,
  S extends AuditMixinBase<T, ID, Relations>,
>(
  constructor: S & AuditMixinBase<T, ID, Relations>,
  opt: IAuditMixinOptions,
): S & AuditMixinBase<T, ID, Relations> {
  const ConditionalRepo =
    process.env.ADD_AUDIT_LOG_MIXIN === 'true'
      ? AuditRepositoryMixin<T, ID, Relations, string, S>(constructor, opt)
      : constructor;
  Object.defineProperty(ConditionalRepo, 'name', {value: constructor.name});
  return ConditionalRepo;
}
