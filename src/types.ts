import {AuditLogRepository} from './repositories';
import {Options} from '@loopback/repository';

export const AuditDbSourceName = 'AuditDB';
export interface IAuditMixin<UserID> {
  getAuditLogRepository: () => Promise<AuditLogRepository>;
  getCurrentUser?: () => Promise<{id?: UserID}>;
}

export interface IAuditMixinOptions {
  actionKey: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}
export interface AuditLogOption {
  noAudit: boolean;
}
export declare type AuditOptions = Options & AuditLogOption;
