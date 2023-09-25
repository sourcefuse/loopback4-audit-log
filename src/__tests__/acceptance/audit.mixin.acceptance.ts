import {expect, sinon} from '@loopback/testlab';
import {v4 as uuidv4} from 'uuid';
import {Action, User} from '../..';
import {TestAuditDataSource} from './fixtures/datasources/audit.datasource';
import {TestDataSource} from './fixtures/datasources/test.datasource';
import {TestModel} from './fixtures/models/test.model';
import {TestAuditLogErrorRepository} from './fixtures/repositories/audit-error.repository';
import {TestAuditLogRepository} from './fixtures/repositories/audit.repository';
import {
  testAuditOpts,
  TestRepository,
} from './fixtures/repositories/test.repository';

export let consoleMessage: string;
console.error = (message: string) => {
  consoleMessage = message;
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
  const testDataSourceInstance = new TestDataSource();
  const getCurrentUser = sinon.stub().resolves(mockUser);
  const auditLogRepositoryInstance = new TestAuditLogRepository(
    new TestAuditDataSource(),
  );
  const actorIdKey = 'id';
  const getAuditLogRepository = sinon
    .stub()
    .resolves(auditLogRepositoryInstance);
  const testRepositoryInstance = new TestRepository(
    testDataSourceInstance,
    getCurrentUser,
    getAuditLogRepository,
    actorIdKey,
  );

  beforeEach(async () => {
    await auditLogRepositoryInstance.deleteAll();
  });
  it('should create audit log when new item is created', async () => {
    const mockItem = getMockItem();
    const createMethodResponse = await testRepositoryInstance.create(mockItem);
    const auditLog = await auditLogRepositoryInstance.find();
    const storedRecords = await testRepositoryInstance.find({
      where: {
        id: mockItem.id,
        description: mockItem.description,
        itemName: mockItem.itemName,
      },
    });
    const expectedAuditLog = {
      action: Action.INSERT_ONE,
      actedOn: TestModel.name,
      actionKey: testAuditOpts.actionKey,
      entityId: mockItem.id,
      actor: mockUser.id,
      before: undefined,
      after: {
        id: mockItem.id,
        itemName: mockItem.itemName,
        description: mockItem.description,
      },
    };

    expect(createMethodResponse).to.match(mockItem);
    expect(auditLog.length).to.equal(1);
    expect(auditLog[0]).to.containDeep(expectedAuditLog);
    expect(auditLog[0].actedAt).to.be.Date();

    //check if stores in db
    expect(storedRecords.length).to.equal(1);
  });

  it('should not create audit log when options.noAudit is set to true on creating new item', async () => {
    const mockItem = getMockItem();
    const createMethodResponse = await testRepositoryInstance.create(mockItem, {
      noAudit: true,
    });
    expect(createMethodResponse).to.match(mockItem);
    const storedRecords = await testRepositoryInstance.find({
      where: {
        id: mockItem.id,
        description: mockItem.description,
        itemName: mockItem.itemName,
      },
    });

    const auditLog = await auditLogRepositoryInstance.find();

    expect(auditLog.length).to.equal(0);
    //check if stores in db
    expect(storedRecords.length).to.equal(1);
  });

  it('should create audit log when new items are created on calling createAll', async () => {
    const mockItemArray = getMockItemArray();
    const createMethodResponse =
      await testRepositoryInstance.createAll(mockItemArray);
    expect(createMethodResponse).to.match(mockItemArray);

    //check if stored in db
    const storedRecords = await testRepositoryInstance.find({
      where: {
        or: [
          {id: mockItemArray[0].id},
          {id: mockItemArray[1].id},
          {id: mockItemArray[2].id},
        ],
      },
    });
    expect(storedRecords.length).to.equal(3);

    //check if audit log is stored
    const auditLog = await auditLogRepositoryInstance.find();
    auditLog.sort((a, b) => (a.entityId > b.entityId ? 1 : -1));
    mockItemArray.sort((a, b) => (a.id > b.id ? 1 : -1));
    expect(auditLog.length).to.equal(mockItemArray.length);
    auditLog.forEach((auditData, index) => {
      const expectedAuditLog = {
        action: Action.INSERT_MANY,
        actedOn: TestModel.name,
        actionKey: testAuditOpts.actionKey,
        entityId: mockItemArray[index].id,
        actor: mockUser.id,
        before: undefined,
        after: mockItemArray[index],
      };
      expect(auditData).to.containDeep(expectedAuditLog);
      expect(auditData.actedAt).to.be.Date();
    });
  });

  it('should not create audit log when options.noAudit is set to true on creating new items on calling createAll', async () => {
    const mockItemArray = getMockItemArray();
    const createMethodResponse = await testRepositoryInstance.createAll(
      mockItemArray,
      {noAudit: true},
    );
    expect(createMethodResponse).to.match(mockItemArray);

    //check if stored in db
    const storedRecords = await testRepositoryInstance.find({
      where: {
        or: [
          {id: mockItemArray[0].id},
          {id: mockItemArray[1].id},
          {id: mockItemArray[2].id},
        ],
      },
    });
    expect(storedRecords.length).to.equal(3);

    //check if audit log is not stored
    const auditLog = await auditLogRepositoryInstance.find();
    expect(auditLog.length).to.equal(0);
  });
  it('should create audit log when items are deleted on calling deleteAll', async () => {
    //create dummy data to be deleted
    const mockItemArray = getMockItemArray();
    await createDummyDataFromArray(mockItemArray);

    const deleteAllMethodResponse = await testRepositoryInstance.deleteAll({
      id: {
        inq: mockItemArray.map(item => item.id),
      },
    });
    expect(deleteAllMethodResponse.count).to.equal(mockItemArray.length);

    //check if deleted from db
    const storedRecords = await testRepositoryInstance.find({
      where: {
        id: {
          inq: mockItemArray.map(item => item.id),
        },
      },
    });
    expect(storedRecords.length).to.equal(0);

    //check if audit log is stored
    const auditLog = await auditLogRepositoryInstance.find();
    auditLog.sort((a, b) => (a.entityId > b.entityId ? 1 : -1));
    mockItemArray.sort((a, b) => (a.id > b.id ? 1 : -1));
    expect(auditLog.length).to.equal(mockItemArray.length);
    auditLog.forEach((auditData, index) => {
      const expectedAuditLog = {
        action: Action.DELETE_MANY,
        actedOn: TestModel.name,
        actionKey: testAuditOpts.actionKey,
        entityId: mockItemArray[index].id,
        actor: mockUser.id,
        before: mockItemArray[index],
        after: undefined,
      };
      expect(auditData).to.containDeep(expectedAuditLog);
      expect(auditData.actedAt).to.be.Date();
    });
  });
  it('should not create audit log when options.noAudit is set to true on deleteing new items on calling deleteAll', async () => {
    //create dummy data to be deleted
    const mockItemArray = getMockItemArray();
    await createDummyDataFromArray(mockItemArray);

    const deleteAllMethodResponse = await testRepositoryInstance.deleteAll(
      {
        id: {
          inq: mockItemArray.map(item => item.id),
        },
      },
      {noAudit: true},
    );
    expect(deleteAllMethodResponse.count).to.equal(mockItemArray.length);

    //check if deleted from db
    const storedRecords = await testRepositoryInstance.find({
      where: {
        id: {
          inq: mockItemArray.map(item => item.id),
        },
      },
    });
    expect(storedRecords.length).to.equal(0);

    //check if audit log is not stored
    const auditLog = await auditLogRepositoryInstance.find();
    expect(auditLog.length).to.equal(0);
  });
  it('should create audit log for deleted item on calling deleteById', async () => {
    //create dummy data to be deleted
    const mockItem = getMockItem();
    await createDummyData(mockItem);

    await testRepositoryInstance.deleteById(mockItem.id);

    //check if deleted from db
    const storedRecords = await testRepositoryInstance.find({
      where: {id: mockItem.id},
    });
    expect(storedRecords.length).to.equal(0);

    //check if Audit log is stored
    const auditLog = await auditLogRepositoryInstance.find();
    const expectedAuditLog = {
      action: Action.DELETE_ONE,
      actedOn: TestModel.name,
      actionKey: testAuditOpts.actionKey,
      entityId: mockItem.id,
      actor: mockUser.id,
      before: mockItem,
      after: undefined,
    };
    expect(auditLog.length).to.equal(1);
    expect(auditLog[0]).to.containDeep(expectedAuditLog);
    expect(auditLog[0].actedAt).to.be.Date();
  });
  it('should not create audit log for deleted item when options.noAudit is set on calling deleteById', async () => {
    //create dummy data to be deleted
    const mockItem = getMockItem();
    await createDummyData(mockItem);

    await testRepositoryInstance.deleteById(mockItem.id, {noAudit: true});

    //check if deleted from db
    const storedRecords = await testRepositoryInstance.find({
      where: {id: mockItem.id},
    });
    expect(storedRecords.length).to.equal(0);

    //check if Audit log is stored
    const auditLog = await auditLogRepositoryInstance.find();
    expect(auditLog.length).to.equal(0);
  });

  it('should create audit log for replaced item on calling replaceById', async () => {
    //create dummy data to be replaced
    const mockItem = getMockItem();
    await createDummyData(mockItem);

    await testRepositoryInstance.replaceById(mockItem.id, {
      itemName: 'replacedTestItem',
      description: 'replacedTestDescription',
    });

    //check if replaced in db
    const storedRecords = await testRepositoryInstance.find({
      where: {
        id: mockItem.id,
        itemName: 'replacedTestItem',
        description: 'replacedTestDescription',
      },
    });
    expect(storedRecords.length).to.equal(1);

    //check if audit log is stored
    const auditLog = await auditLogRepositoryInstance.find();
    expect(auditLog.length).to.equal(1);
    const expectedAuditLog = {
      action: Action.UPDATE_ONE,
      actedOn: TestModel.name,
      actionKey: testAuditOpts.actionKey,
      entityId: mockItem.id,
      actor: mockUser.id,
      before: mockItem,
      after: {
        id: mockItem.id,
        itemName: 'replacedTestItem',
        description: 'replacedTestDescription',
      },
    };
    expect(auditLog[0]).to.containDeep(expectedAuditLog);
    expect(auditLog[0].actedAt).to.be.Date();
  });

  it('should not create audit log for replaced item when options.noAudit is set on calling replaceById', async () => {
    //create dummy data to be replaced
    const mockItem = getMockItem();
    await createDummyData(mockItem);

    await testRepositoryInstance.replaceById(
      mockItem.id,
      {itemName: 'replacedTestItem', description: 'replacedTestDescription'},
      {noAudit: true},
    );

    //check if replaced in db
    const storedRecords = await testRepositoryInstance.find({
      where: {
        id: mockItem.id,
        itemName: 'replacedTestItem',
        description: 'replacedTestDescription',
      },
    });
    expect(storedRecords.length).to.equal(1);

    //check if audit log is not stored
    const auditLog = await auditLogRepositoryInstance.find();
    expect(auditLog.length).to.equal(0);
  });

  it('should create audit log for updated item on calling updateById', async () => {
    //create dummy data to be updated
    const mockItem = getMockItem();
    await createDummyData(mockItem);

    await testRepositoryInstance.updateById(mockItem.id, {
      itemName: 'replacedTestItem',
      description: 'replacedTestDescription',
    });

    //check if replaced in db
    const storedRecords = await testRepositoryInstance.find({
      where: {
        id: mockItem.id,
        itemName: 'replacedTestItem',
        description: 'replacedTestDescription',
      },
    });
    expect(storedRecords.length).to.equal(1);

    //check if audit log is stored
    const auditLog = await auditLogRepositoryInstance.find();
    expect(auditLog.length).to.equal(1);
    const expectedAuditLog = {
      action: Action.UPDATE_ONE,
      actedOn: TestModel.name,
      actionKey: testAuditOpts.actionKey,
      entityId: mockItem.id,
      actor: mockUser.id,
      before: mockItem,
      after: {
        id: mockItem.id,
        itemName: 'replacedTestItem',
        description: 'replacedTestDescription',
      },
    };

    expect(auditLog[0]).to.containDeep(expectedAuditLog);
    expect(auditLog[0].actedAt).to.be.Date();
  });

  it('should not create audit log for updated item when options.noAudit is set on calling updateById', async () => {
    //create dummy data to be replaced
    const mockItem = getMockItem();
    await createDummyData(mockItem);

    await testRepositoryInstance.updateById(
      mockItem.id,
      {itemName: 'replacedTestItem', description: 'replacedTestDescription'},
      {noAudit: true},
    );

    //check if replaced in db
    const storedRecords = await testRepositoryInstance.find({
      where: {
        id: mockItem.id,
        itemName: 'replacedTestItem',
        description: 'replacedTestDescription',
      },
    });
    expect(storedRecords.length).to.equal(1);

    //check if audit log is not stored
    const auditLog = await auditLogRepositoryInstance.find();
    expect(auditLog.length).to.equal(0);
  });

  it('should create audit log for updated items on calling updateAll', async () => {
    //create dummy data to be updated
    const mockItemArray = getMockItemArray();
    await createDummyDataFromArray(mockItemArray);

    await testRepositoryInstance.updateAll(
      {itemName: 'replacedTestItem', description: 'replacedTestDescription'},
      {
        id: {
          inq: mockItemArray.map(item => item.id),
        },
      },
    );
    //check if updated in db
    const storedRecords = await testRepositoryInstance.find({
      where: {
        id: {
          inq: mockItemArray.map(item => item.id),
        },
        itemName: 'replacedTestItem',
        description: 'replacedTestDescription',
      },
    });
    expect(storedRecords.length).to.equal(3);

    //check if audit log is stored
    const auditLog = await auditLogRepositoryInstance.find();
    auditLog.sort((a, b) => (a.entityId > b.entityId ? 1 : -1));
    mockItemArray.sort((a, b) => (a.id > b.id ? 1 : -1));
    expect(auditLog.length).to.equal(mockItemArray.length);
    auditLog.forEach((auditData, index) => {
      const expectedAuditLog = {
        action: Action.UPDATE_MANY,
        actedOn: TestModel.name,
        actionKey: testAuditOpts.actionKey,
        entityId: mockItemArray[index].id,
        actor: mockUser.id,
        before: mockItemArray[index],
        after: {
          id: mockItemArray[index].id,
          itemName: 'replacedTestItem',
          description: 'replacedTestDescription',
        },
      };
      expect(auditData).to.containDeep(expectedAuditLog);
      expect(auditData.actedAt).to.be.Date();
    });
  });
  it('should not create audit log for updated items when options.noAudit is set on calling updateAll', async () => {
    //create dummy data to be updated
    const mockItemArray = getMockItemArray();
    await createDummyDataFromArray(mockItemArray);

    await testRepositoryInstance.updateAll(
      {itemName: 'replacedTestItem', description: 'replacedTestDescription'},
      {
        id: {
          inq: mockItemArray.map(item => item.id),
        },
      },
      {noAudit: true},
    );

    //check if updated in db
    const storedRecords = await testRepositoryInstance.find({
      where: {
        id: {
          inq: mockItemArray.map(item => item.id),
        },
        itemName: 'replacedTestItem',
        description: 'replacedTestDescription',
      },
    });
    expect(storedRecords.length).to.equal(3);

    //check if audit log is stored
    const auditLog = await auditLogRepositoryInstance.find();
    expect(auditLog.length).to.equal(0);
  });

  const auditLogErrorRepositoryInstance = new TestAuditLogErrorRepository();
  const auditLogErrorRepository = sinon
    .stub()
    .resolves(auditLogErrorRepositoryInstance); //repository which will cause catch statements to execute
  const testRepositoryAuditLogErrorInstance = new TestRepository(
    testDataSourceInstance,
    getCurrentUser,
    auditLogErrorRepository,
  );

  it(`should log appropriate message when audit log can't be created on calling create method`, async () => {
    const mockItem = getMockItem();
    await testRepositoryAuditLogErrorInstance.create(mockItem);

    const expectedConsoleMessageValues = [
      `Audit failed for data =>`,
      `"actedAt":`,
      `"actor":"${mockUser.id}"`,
      `"action":"${Action.INSERT_ONE}"`,
      `"after":`,
      `"id":`,
      `"itemName":"${mockItem.itemName}"`,
      `"description":"${mockItem.description}"`,
      `"entityId":`,
      `"actedOn":"${TestModel.name}"`,
      `"actionKey":"${testAuditOpts.actionKey}"`,
    ];
    expectedConsoleMessageValues.forEach(expectedValue => {
      expect(consoleMessage.includes(expectedValue)).to.be.true();
    });
  });
  it(`should log appropriate message when audit log can't be created on calling createAll method`, async () => {
    const mockItemArray = getMockItemArray();
    await testRepositoryAuditLogErrorInstance.createAll(mockItemArray);

    const expectedConsoleMessageValues = [
      `Audit failed for data =>`,
      `"actedAt":`,
      `"actor":"${mockUser.id}"`,
      `"action":"${Action.INSERT_MANY}"`,
      `"after":`,
      `"id":`,
      `"itemName":`,
      `"description":`,
      `"entityId":`,
      `"actedOn":"${TestModel.name}"`,
      `"actionKey":"${testAuditOpts.actionKey}"`,
    ];
    expectedConsoleMessageValues.forEach(expectedValue => {
      expect(consoleMessage.includes(expectedValue)).to.be.true();
    });
  });
  it(`should log appropriate message when audit log can't be created on calling deleteAll method`, async () => {
    //create dummy data to be deleted
    const mockItemArray = getMockItemArray();
    await createDummyDataFromArrayFalse(mockItemArray);

    await testRepositoryAuditLogErrorInstance.deleteAll({
      id: {
        inq: mockItemArray.map(item => item.id),
      },
    });

    const expectedConsoleMessageValues = [
      `Audit failed for data =>`,
      `"actedAt":`,
      `"actor":"${mockUser.id}"`,
      `"action":"${Action.DELETE_MANY}"`,
      `"before":`,
      `"id":`,
      `"itemName":`,
      `"description":`,
      `"entityId":`,
      `"actedOn":"${TestModel.name}"`,
      `"actionKey":"${testAuditOpts.actionKey}"`,
    ];
    expectedConsoleMessageValues.forEach(expectedValue => {
      expect(consoleMessage.includes(expectedValue)).to.be.true();
    });
  });

  it(`should log appropriate message when audit log can't be created on calling updateAll method`, async () => {
    //create dummy data to be updated
    const mockItemArray = getMockItemArray();
    await createDummyDataFromArrayFalse(mockItemArray);

    await testRepositoryAuditLogErrorInstance.updateAll(
      {itemName: 'replacedTestItem', description: 'replacedTestDescription'},
      {
        id: {
          inq: mockItemArray.map(item => item.id),
        },
      },
    );

    const expectedConsoleMessageValues = [
      `Audit failed for data =>`,
      `"actedAt":`,
      `"actor":"${mockUser.id}"`,
      `"action":"${Action.UPDATE_MANY}"`,
      `"before":`,
      `"after":`,
      `"id":`,
      `"itemName":`,
      `"description":`,
      `"entityId":`,
      `"actedOn":"${TestModel.name}"`,
      `"actionKey":"${testAuditOpts.actionKey}"`,
    ];
    expectedConsoleMessageValues.forEach(expectedValue => {
      expect(consoleMessage.includes(expectedValue)).to.be.true();
    });
  });

  it(`should log appropriate message when audit log can't be created on calling updateById method`, async () => {
    //create dummy data to be replaced
    const mockItem = getMockItem();
    await createDummyDataFalse(mockItem);

    await testRepositoryAuditLogErrorInstance.updateById(mockItem.id, {
      itemName: 'replacedTestItem',
      description: 'replacedTestDescription',
    });

    const expectedConsoleMessageValues = [
      `Audit failed for data =>`,
      `"actedAt":`,
      `"actor":"${mockUser.id}"`,
      `"action":"${Action.UPDATE_ONE}"`,
      `"before":`,
      `"after":`,
      `"id":`,
      `"itemName":"${mockItem.itemName}"`,
      `"description":"${mockItem.description}"`,
      `"entityId":`,
      `"actedOn":"${TestModel.name}"`,
      `"actionKey":"${testAuditOpts.actionKey}"`,
    ];
    expectedConsoleMessageValues.forEach(expectedValue => {
      expect(consoleMessage.includes(expectedValue)).to.be.true();
    });
  });
  it(`should log appropriate message when audit log can't be created on calling replaceById method`, async () => {
    //create dummy data to be replaced
    const mockItem = getMockItem();
    await createDummyDataFalse(mockItem);

    await testRepositoryAuditLogErrorInstance.replaceById(mockItem.id, {
      itemName: 'replacedTestItem',
      description: 'replacedTestDescription',
    });

    const expectedConsoleMessageValues = [
      `Audit failed for data =>`,
      `"actedAt":`,
      `"actor":"${mockUser.id}"`,
      `"action":"${Action.UPDATE_ONE}"`,
      `"before":`,
      `"after":`,
      `"id":`,
      `"itemName":"${mockItem.itemName}"`,
      `"description":"${mockItem.description}"`,
      `"entityId":`,
      `"actedOn":"${TestModel.name}"`,
      `"actionKey":"${testAuditOpts.actionKey}"`,
    ];
    expectedConsoleMessageValues.forEach(expectedValue => {
      expect(consoleMessage.includes(expectedValue)).to.be.true();
    });
  });
  it(`should log appropriate message when audit log can't be created on calling deleteById method`, async () => {
    //create dummy data to be deleted
    const mockItem = getMockItem();
    await createDummyDataFalse(mockItem);

    await testRepositoryAuditLogErrorInstance.deleteById(mockItem.id);

    const expectedConsoleMessageValues = [
      `Audit failed for data =>`,
      `"actedAt":`,
      `"actor":"${mockUser.id}"`,
      `"action":"${Action.DELETE_ONE}"`,
      `"before":`,
      `"id":`,
      `"itemName":"${mockItem.itemName}"`,
      `"description":"${mockItem.description}"`,
      `"entityId":`,
      `"actedOn":"${TestModel.name}"`,
      `"actionKey":"${testAuditOpts.actionKey}"`,
    ];

    expectedConsoleMessageValues.forEach(expectedValue => {
      expect(consoleMessage.includes(expectedValue)).to.be.true();
    });
  });

  async function createDummyDataFromArrayFalse(
    mockItemArray: {id: string; itemName: string; description: string}[],
  ) {
    await testRepositoryAuditLogErrorInstance.createAll(mockItemArray, {
      noAudit: true,
    });
  }
  async function createDummyDataFalse(mockItem: {
    id: string;
    itemName: string;
    description: string;
  }) {
    await testRepositoryAuditLogErrorInstance.create(mockItem, {noAudit: true});
  }

  async function createDummyDataFromArray(
    mockItemArray: {id: string; itemName: string; description: string}[],
  ) {
    await testRepositoryInstance.createAll(mockItemArray, {noAudit: true});
  }
  async function createDummyData(mockItem: {
    id: string;
    itemName: string;
    description: string;
  }) {
    await testRepositoryInstance.create(mockItem, {noAudit: true});
  }
  function getMockItem() {
    const item = {
      id: uuidv4(),
      itemName: 'testItem',
      description: 'testDescription',
    };
    return item;
  }
  function getMockItemArray() {
    const item = [
      {id: uuidv4(), itemName: 'testItem1', description: 'testDescription1'},
      {id: uuidv4(), itemName: 'testItem2', description: 'testDescription2'},
      {id: uuidv4(), itemName: 'testItem3', description: 'testDescription3'},
    ];
    return item;
  }
});
