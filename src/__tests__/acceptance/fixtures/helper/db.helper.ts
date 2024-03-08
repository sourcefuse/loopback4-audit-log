import {IAuthUserWithPermissions} from '@sourceloop/core';
import {DummyAuditServiceApplication} from '../dummy-application';
import {TestRepository} from '../repositories/test.repository';
import {AuditLogRepository} from '../../../../repositories';
import {TestAuditLogErrorRepository} from '../repositories/audit-error.repository';
import {TestErrorRepository} from '../repositories/test-error.repository';

const pass = 'test_password';
const id = '9640864d-a84a-e6b4-f20e-918ff280cdaa';
const tenantId = 'fac65aad-3f01-dd25-3ea0-ee6563fbe02b';
export const testUser: IAuthUserWithPermissions = {
  id: id,
  userTenantId: id,
  username: 'test_user',
  tenantId: tenantId,
  authClientId: 1,
  role: 'test-role',
  firstName: 'testuser',
  lastName: 'sf',
  password: pass,
  permissions: [],
};
let auditLogRepositoryInstance: AuditLogRepository;
let testRepositoryInstance: TestRepository;
let auditLogErrorRepositoryInstance: TestAuditLogErrorRepository;
let testRepositoryAuditLogErrorInstance: TestErrorRepository;

export async function getTestDBRepositories(app: DummyAuditServiceApplication) {
  auditLogRepositoryInstance = await app.getRepository(AuditLogRepository);
  testRepositoryInstance = await app.getRepository(TestRepository);
  auditLogErrorRepositoryInstance = await app.getRepository(
    TestAuditLogErrorRepository,
  );
  testRepositoryAuditLogErrorInstance =
    await app.getRepository(TestErrorRepository);
  return {
    auditLogRepositoryInstance,
    testRepositoryInstance,
    auditLogErrorRepositoryInstance,
    testRepositoryAuditLogErrorInstance,
  };
}
