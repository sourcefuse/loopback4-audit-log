import {AuditLogRepository} from './repositories';

export const AuditDbSourceName = 'AuditDB';
import {Options} from '@loopback/repository';
export interface IAuditMixin<UserID> {
  getAuditLogRepository: () => Promise<AuditLogRepository>;
  getCurrentUser?: () => Promise<{id?: UserID}>;
}

export interface IAuditMixinOptions {
  actionKey: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}
interface AuditLogOption {
  noAuditCreation: boolean;
}
export declare type AuditOptions = Options & AuditLogOption;
