import {expect} from '@loopback/testlab';
import {DefaultCrudRepository, Entity} from '@loopback/repository';
import {ConditionalAuditRepositoryMixin} from '../../mixins/conditional-audit.mixin';
import {IAuditMixinOptions} from '../../types';

const mockAuditOpts: IAuditMixinOptions = {
  actionKey: 'Mock_Audit_Logs',
};
describe('ConditionalAuditRepositoryMixin', () => {
  class MyEntity extends Entity {
    id: number;
    name: string;
  }

  class MyRepository extends DefaultCrudRepository<
    MyEntity,
    typeof MyEntity.prototype.id
  > {}

  beforeEach(() => {
    delete process.env.ADD_AUDIT_LOG_MIXIN;
  });

  it('returns the original repository when ADD_AUDIT_LOG_MIXIN is not set', () => {
    const result = ConditionalAuditRepositoryMixin(MyRepository, mockAuditOpts);
    expect(result).to.equal(MyRepository);
    expect(result.prototype).to.be.instanceof(DefaultCrudRepository);
  });

  it('returns the repository with AuditRepositoryMixin when ADD_AUDIT_LOG_MIXIN is set to true', () => {
    process.env.ADD_AUDIT_LOG_MIXIN = 'true';
    const result = ConditionalAuditRepositoryMixin(MyRepository, mockAuditOpts);
    expect(result).to.not.equal(MyRepository);
    expect(result.prototype).to.be.instanceof(DefaultCrudRepository);
  });

  it('sets the name property of the returned repository to the name of the original repository', () => {
    process.env.ADD_AUDIT_LOG_MIXIN = 'true';
    const result = ConditionalAuditRepositoryMixin(MyRepository, mockAuditOpts);
    expect(result).to.have.property('name', 'MyRepository');
  });
});
