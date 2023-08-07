import {Constructor, Getter} from '@loopback/core';
import {DefaultCrudRepository, Entity, juggler} from '@loopback/repository';
import {expect, sinon} from '@loopback/testlab';
import {
  Action,
  AuditLog,
  AuditRepositoryMixin,
  IAuditMixinOptions,
  User,
} from '../..';
import {consoleMessage} from '../acceptance/audit.mixin.acceptance';
import {
  MockClass,
  mockClassMethodCall,
  optionsReceivedByParentRepository,
  resetMethodCalls,
} from './fixtures/mockClass';
import {mockData, mockDataArray, resetMockData} from './fixtures/mockData';
import {MockModel} from './fixtures/mockModel';

let auditData: AuditLog;
let auditDataArray: AuditLog[];
let auditCreateCalled = false;
let auditCreateAllCalled = false;

class MockAuditRepo {
  create(audit: AuditLog) {
    auditData = audit;
    auditCreateCalled = true;
    return Promise.resolve('Audit Created');
  }
  createAll(auditArray: AuditLog[]) {
    auditDataArray = auditArray;
    auditCreateAllCalled = true;
    return Promise.resolve('Audit Created');
  }
}

class MockAuditRepoError {
  create(audit: AuditLog) {
    auditCreateCalled = true;
    return Promise.reject('Error');
  }
  createAll(auditArray: AuditLog[]) {
    auditCreateAllCalled = true;
    return Promise.reject('Error');
  }
}

const mockOpts: IAuditMixinOptions = {
  actionKey: 'Test_Logs',
};
const mockUser: User = {
  id: 'testCurrentUserId',
  username: 'testCurrentUserName',
  authClientId: 123,
  permissions: ['1', '2', '3'],
  role: 'admin',
  firstName: 'test',
  lastName: 'lastname',
  tenantId: 'tenantId',
  userTenantId: 'userTenantId',
};

describe('Audit Mixin', () => {
  class ReturnedMixedClass extends AuditRepositoryMixin<
    MockModel,
    typeof MockModel.prototype.id,
    {},
    string,
    Constructor<
      DefaultCrudRepository<MockModel, typeof MockModel.prototype.id, {}>
    >
  >(MockClass, mockOpts) {
    constructor(
      entityClass: typeof Entity & {
        prototype: MockModel;
      },
      dataSource: juggler.DataSource,
      readonly getCurrentUser?: Getter<typeof mockUser>,
    ) {
      super(entityClass, dataSource);
    }
  }

  const ds: juggler.DataSource = new juggler.DataSource({
    name: 'db',
    connector: 'memory',
  });
  const returnedMixedClassInstance = new ReturnedMixedClass(
    MockModel,
    ds,
    sinon.stub().resolves(mockUser),
  );
  returnedMixedClassInstance.getAuditLogRepository = sinon
    .stub()
    .resolves(new MockAuditRepo());

  // for checking message in case Audit can't be made due to any reason

  const returnedMixedClassErrorInstance = new ReturnedMixedClass(
    MockModel,
    ds,
    sinon.stub().resolves(mockUser),
  );
  returnedMixedClassErrorInstance.getAuditLogRepository = sinon
    .stub()
    .resolves(new MockAuditRepoError());

  beforeEach(() => {
    auditCreateCalled = false;
    auditCreateAllCalled = false;
    resetMethodCalls();
    resetMockData();
  });

  it('should return newly created record on calling create method with noAudit option set', async () => {
    const result = await returnedMixedClassInstance.create(mockData, {
      noAudit: true,
    });
    expect(result).to.be.equal(mockData);
    expect(auditCreateCalled).to.be.false();
    //check if super class method called
    expect(mockClassMethodCall.create).to.be.true();
  });
  it('should return newly created record and create appropriate Audit Log on calling create method', async () => {
    const result = await returnedMixedClassInstance.create(mockData);
    expect(result).to.be.equal(mockData);
    expect(auditCreateCalled).to.be.true();

    //check if super class method called
    expect(mockClassMethodCall.create).to.be.true();

    // checking audit data sent
    const expectedAuditLog = {
      action: Action.INSERT_ONE,
      actedOn: MockModel.name,
      actionKey: mockOpts.actionKey,
      entityId: mockData.id,
      actor: mockUser.id,
      before: undefined,
      after: mockData.toObject(),
    };
    expect(auditData).to.containDeep(expectedAuditLog);
    expect(auditData.actedAt).to.be.Date();
  });

  it('should return newly created records on calling createAll method with noAudit option set', async () => {
    const result = await returnedMixedClassInstance.createAll(mockDataArray, {
      noAudit: true,
    });
    expect(result).to.be.equal(mockDataArray);
    expect(auditCreateAllCalled).to.be.false();
    //check if super class method called
    expect(mockClassMethodCall.createAll).to.be.true();
  });

  it('should return newly created records and create appropriate Audit Logs on calling createAll method', async () => {
    const result = await returnedMixedClassInstance.createAll(mockDataArray);
    expect(result).to.be.equal(mockDataArray);
    expect(auditCreateAllCalled).to.be.true();

    //check if super class method called
    expect(mockClassMethodCall.createAll).to.be.true();

    //checking audit data sent

    auditDataArray.forEach((audit, index) => {
      const expectedAuditLog = {
        action: Action.INSERT_MANY,
        actedOn: MockModel.name,
        actionKey: mockOpts.actionKey,
        entityId: mockDataArray[index].id,
        actor: mockUser.id,
        before: undefined,
        after: mockDataArray[index].toObject(),
      };
      expect(audit).to.containDeep(expectedAuditLog);
      expect(audit.actedAt).to.be.Date();
    });
  });

  it('should delete record on calling deleteById method with noAudit option set', async () => {
    await returnedMixedClassInstance.deleteById(mockData.id, {noAudit: true});
    expect(auditCreateCalled).to.be.false();
    //check if super class method called
    expect(mockClassMethodCall.deleteById).to.be.true();
  });

  it('should delete record and create appropriate Audit Log on calling deleteById method', async () => {
    await returnedMixedClassInstance.deleteById(mockData.id);
    expect(auditCreateCalled).to.be.true();

    //check if super class method called
    expect(mockClassMethodCall.deleteById).to.be.true();

    //checking audit data sent

    const expectedAuditLog = {
      action: Action.DELETE_ONE,
      actedOn: MockModel.name,
      actionKey: mockOpts.actionKey,
      entityId: mockData.id,
      actor: mockUser.id,
      before: mockData.toObject(),
      after: undefined,
    };
    expect(auditData).to.containDeep(expectedAuditLog);
    expect(auditData.actedAt).to.be.Date();
  });
  it('should delete records on calling deleteAll method with noAudit option set', async () => {
    const result = await returnedMixedClassInstance.deleteAll(
      {},
      {noAudit: true},
    );
    expect(result.count).to.be.equal(mockDataArray.length);
    expect(auditCreateAllCalled).to.be.false();

    //check if super class method called
    expect(mockClassMethodCall.deleteAll).to.be.true();
  });

  it('should delete records and create appropriate Audit Logs on calling deleteAll method', async () => {
    await returnedMixedClassInstance.deleteAll();
    expect(auditCreateAllCalled).to.be.true();

    //check if super class method called
    expect(mockClassMethodCall.deleteAll).to.be.true();

    //checking audit data sent

    auditDataArray.forEach((audit, index) => {
      const expectedAuditLog = {
        action: Action.DELETE_MANY,
        actedOn: MockModel.name,
        actionKey: mockOpts.actionKey,
        entityId: mockDataArray[index].id,
        actor: mockUser.id,
        before: mockDataArray[index].toObject(),
        after: undefined,
      };
      expect(audit.actedAt).to.be.Date();
      expect(audit).to.containDeep(expectedAuditLog);
    });
  });
  it('should update record on calling updateById method with noAudit option set', async () => {
    await returnedMixedClassInstance.updateById(
      mockData.id,
      {
        itemName: 'replacedTestItemName',
        description: 'replacedTestItemDescription',
      },
      {noAudit: true},
    );

    expect(auditCreateCalled).to.be.false();

    //check if super class method called
    expect(mockClassMethodCall.updateById).to.be.true();
  });

  it("should forward the options param to base repository's findById method", async () => {
    const options = {someTestKey: 'someTestValue'};
    await returnedMixedClassInstance.updateById(
      mockData.id,
      {
        itemName: 'replacedTestItemName',
        description: 'replacedTestItemDescription',
      },
      options,
    );

    // check if findById received the options originally passed to mixined class
    expect(optionsReceivedByParentRepository.findById).to.be.eql(options);
  });
  it('should update record and create appropriate Audit Log on calling updateById method', async () => {
    const beforeMockData = Object.assign({}, mockData);

    await returnedMixedClassInstance.updateById(mockData.id, {
      itemName: 'replacedTestItemName',
      description: 'replacedTestItemDescription',
    }); //this will update mock data

    expect(auditCreateCalled).to.be.true();

    //check if super class method called
    expect(mockClassMethodCall.updateById).to.be.true();

    //checking audit data sent

    const expectedAuditLog = {
      action: Action.UPDATE_ONE,
      actedOn: MockModel.name,
      actionKey: mockOpts.actionKey,
      entityId: mockData.id,
      actor: mockUser.id,
      before: beforeMockData.toObject(),
      after: mockData.toObject(),
    };
    expect(auditData).to.containDeep(expectedAuditLog);
    expect(auditData.actedAt).to.be.Date();
  });

  it('should update record on calling replaceById method with noAudit option set', async () => {
    await returnedMixedClassInstance.replaceById(
      mockData.id,
      {
        itemName: 'replacedTestItemName',
        description: 'replacedTestItemDescription',
      },
      {noAudit: true},
    );

    expect(auditCreateCalled).to.be.false();

    //check if super class method called
    expect(mockClassMethodCall.replaceById).to.be.true();
  });
  it('should update record and create appropriate Audit Log on calling replaceById method', async () => {
    const beforeMockData = Object.assign({}, mockData);

    await returnedMixedClassInstance.replaceById(mockData.id, {
      itemName: 'replacedTestItemName',
      description: 'replacedTestItemDescription',
    }); //this will update mock data

    expect(auditCreateCalled).to.be.true();

    //check if super class method called
    expect(mockClassMethodCall.replaceById).to.be.true();

    //checking audit data sent
    const expectedAuditLog = {
      action: Action.UPDATE_ONE,
      actedOn: MockModel.name,
      actionKey: mockOpts.actionKey,
      entityId: mockData.id,
      actor: mockUser.id,
      before: beforeMockData.toObject(),
      after: mockData.toObject(),
    };
    expect(auditData).to.containDeep(expectedAuditLog);
    expect(auditData.actedAt).to.be.Date();
  });

  it('should update records on calling updateAll method with noAudit option set', async () => {
    const result = await returnedMixedClassInstance.updateAll(
      {
        itemName: 'replacedTestItemName',
        description: 'replacedTestItemDescription',
      },
      {
        id: {
          inq: mockDataArray.map(item => item.id),
        },
      },
      {noAudit: true},
    );
    expect(result.count).to.be.equal(mockDataArray.length);
    expect(auditCreateAllCalled).to.be.false();

    //check if super class method called
    expect(mockClassMethodCall.updateAll).to.be.true();
  });

  it("should forward the options param to base repository's find method", async () => {
    const options = {someKey: 'someValue'};
    await returnedMixedClassInstance.updateAll(
      {
        itemName: 'replacedTestItemName',
        description: 'replacedTestItemDescription',
      },
      undefined,
      options,
    );

    // check if find method received the options originally passed to mixined class
    expect(optionsReceivedByParentRepository.find).to.be.eql(options);
  });

  it('should update records and create appropriate Audit Logs on calling updateAll method', async () => {
    const beforeMockDataArray = mockDataArray.map(d => {
      return d.toObject();
    });
    await returnedMixedClassInstance.updateAll(
      {
        itemName: 'replacedTestItemName',
        description: 'replacedTestItemDescription',
      },
      {
        id: {
          inq: mockDataArray.map(item => item.id),
        },
      },
    );
    expect(auditCreateAllCalled).to.be.true();

    //check if super class method called
    expect(mockClassMethodCall.updateAll).to.be.true();

    auditDataArray.forEach((audit, index) => {
      const expectedAuditLog = {
        action: Action.UPDATE_MANY,
        actedOn: MockModel.name,
        actionKey: mockOpts.actionKey,
        entityId: mockDataArray[index].id,
        actor: mockUser.id,
        before: beforeMockDataArray[index],
        after: mockDataArray[index].toObject(),
      };
      expect(audit).to.containDeep(expectedAuditLog);
      expect(audit.actedAt).to.be.Date();
    });
  });

  it(`should log appropriate message when audit log can't be created on calling create method`, async () => {
    await returnedMixedClassErrorInstance.create(mockData);

    expect(auditCreateCalled).to.be.true();

    //check if super class method called
    expect(mockClassMethodCall.create).to.be.true();

    //checking audit message when create audit fails
    const expectedConsoleMessageValues = [
      `Audit failed for data =>`,
      `"actedAt":`,
      `"actor":"${mockUser.id}"`,
      `"action":"${Action.INSERT_ONE}"`,
      `"after":${JSON.stringify(mockData.toObject())}`,
      `"entityId":"${mockData.id}"`,
      `"actedOn":"${MockModel.name}"`,
      `"actionKey":"${mockOpts.actionKey}"`,
    ];
    expectedConsoleMessageValues.forEach(expectedValue => {
      expect(consoleMessage.includes(expectedValue)).to.be.true();
    });
  });

  it(`should log appropriate message when audit log can't be created on calling createAll method`, async () => {
    await returnedMixedClassErrorInstance.createAll(mockDataArray);

    expect(auditCreateAllCalled).to.be.true();

    //check if super class method called
    expect(mockClassMethodCall.createAll).to.be.true();

    //check audit message when create audit fails
    const expectedConsoleMessageValues = [
      `Audit failed for data =>`,
      `"actedAt":`,
      `"actor":"${mockUser.id}"`,
      `"action":"${Action.INSERT_MANY}"`,
      `"after":`,
      `"entityId":`,
      `"actedOn":"${MockModel.name}"`,
      `"actionKey":"${mockOpts.actionKey}"`,
    ];
    expectedConsoleMessageValues.forEach(expectedValue => {
      expect(consoleMessage.includes(expectedValue)).to.be.true();
    });
  });

  it(`should log appropriate message when audit log can't be created on calling deleteAll method`, async () => {
    await returnedMixedClassErrorInstance.deleteAll();
    expect(auditCreateAllCalled).to.be.true();

    //check if super class method called
    expect(mockClassMethodCall.deleteAll).to.be.true();

    //check audit message when create audit fails
    const expectedConsoleMessageValues = [
      `Audit failed for data =>`,
      `"actedAt":`,
      `"actor":"${mockUser.id}"`,
      `"action":"${Action.DELETE_MANY}"`,
      `"before":`,
      `"entityId":`,
      `"actedOn":"${MockModel.name}"`,
      `"actionKey":"${mockOpts.actionKey}"`,
    ];
    expectedConsoleMessageValues.forEach(expectedValue => {
      expect(consoleMessage.includes(expectedValue)).to.be.true();
    });
  });

  it(`should log appropriate message when audit log can't be created on calling updateAll method`, async () => {
    await returnedMixedClassErrorInstance.updateAll(
      {
        itemName: 'replacedTestItemName',
        description: 'replacedTestDescription',
      },
      {
        id: {
          inq: mockDataArray.map(item => item.id),
        },
      },
    );
    expect(auditCreateAllCalled).to.be.true();

    //check if super class method called
    expect(mockClassMethodCall.updateAll).to.be.true();

    //check audit message when create audit fails
    const expectedConsoleMessageValues = [
      `Audit failed for data =>`,
      `"actedAt":`,
      `"actor":"${mockUser.id}"`,
      `"action":"${Action.UPDATE_MANY}"`,
      `"before":`,
      `"after":`,
      `"entityId":`,
      `"actedOn":"${MockModel.name}"`,
      `"actionKey":"${mockOpts.actionKey}"`,
    ];
    expectedConsoleMessageValues.forEach(expectedValue => {
      expect(consoleMessage.includes(expectedValue)).to.be.true();
    });
  });

  it(`should log appropriate message when audit log can't be created on calling updateById method`, async () => {
    const beforeMockData = Object.assign({}, mockData);
    await returnedMixedClassErrorInstance.updateById(mockData.id, {
      itemName: 'replacedTestItemName',
      description: 'replacedTestDescription',
    });

    expect(auditCreateCalled).to.be.true();

    //check if super class method called
    expect(mockClassMethodCall.updateById).to.be.true();
    const expectedConsoleMessageValues = [
      `Audit failed for data =>`,
      `"actedAt":`,
      `"actor":"${mockUser.id}"`,
      `"action":"${Action.UPDATE_ONE}"`,
      `"before":${JSON.stringify(beforeMockData.toObject())}`,
      `"after":${JSON.stringify(mockData.toObject())}`,
      `"entityId":"${mockData.id}"`,
      `"actedOn":"${MockModel.name}"`,
      `"actionKey":"${mockOpts.actionKey}"`,
    ];
    expectedConsoleMessageValues.forEach(expectedValue => {
      expect(consoleMessage.includes(expectedValue)).to.be.true();
    });
  });

  it(`should log appropriate message when audit log can't be created on calling replaceById method`, async () => {
    const beforeMockData = Object.assign({}, mockData);
    await returnedMixedClassErrorInstance.replaceById(mockData.id, {
      itemName: 'replacedTestItemName',
      description: 'replacedTestDescription',
    });

    expect(auditCreateCalled).to.be.true();

    //check if super class method called
    expect(mockClassMethodCall.replaceById).to.be.true();
    const expectedConsoleMessageValues = [
      `Audit failed for data =>`,
      `"actedAt":`,
      `"actor":"${mockUser.id}"`,
      `"action":"${Action.UPDATE_ONE}"`,
      `"before":${JSON.stringify(beforeMockData.toObject())}`,
      `"after":${JSON.stringify(mockData.toObject())}`,
      `"entityId":"${mockData.id}"`,
      `"actedOn":"${MockModel.name}"`,
      `"actionKey":"${mockOpts.actionKey}"`,
    ];
    expectedConsoleMessageValues.forEach(expectedValue => {
      expect(consoleMessage.includes(expectedValue)).to.be.true();
    });
  });

  it(`should log appropriate message when audit log can't be created on calling deleteById method`, async () => {
    resetMockData();
    const beforeMockData = Object.assign({}, mockData);
    await returnedMixedClassErrorInstance.deleteById(mockData.id);
    expect(auditCreateCalled).to.be.true();

    //check if super class method called

    expect(mockClassMethodCall.deleteById).to.be.true();

    const expectedConsoleMessageValues = [
      `Audit failed for data =>`,
      `"actedAt":`,
      `"actor":"${mockUser.id}"`,
      `"action":"${Action.DELETE_ONE}"`,
      `"before":${JSON.stringify(beforeMockData.toObject())}`,
      `"entityId":"${mockData.id}"`,
      `"actedOn":"${MockModel.name}"`,
      `"actionKey":"${mockOpts.actionKey}"`,
    ];
    expectedConsoleMessageValues.forEach(expectedValue => {
      expect(consoleMessage.includes(expectedValue)).to.be.true();
    });
  });
});
