import {TestAuditLog} from '../models/audit.model';

export class TestAuditLogErrorRepository {
  create(_audit: TestAuditLog) {
    return Promise.reject('Error');
  }
  createAll(_audit: TestAuditLog[]) {
    return Promise.reject('Error');
  }
}
