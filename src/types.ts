import {AuditLogRepository} from './repositories';

export const AuditDbSourceName = 'AuditDB';

export interface IAuditMixin<UserID> {
  getAuditLogRepository: () => Promise<AuditLogRepository>;
  getCurrentUser?: () => Promise<{id?: UserID}>;
}

export interface IAuditMixinOptions {
  actionKey: string;
}
