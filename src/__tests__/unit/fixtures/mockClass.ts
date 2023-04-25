import {
  DataObject,
  AnyObject,
  Count,
  Entity,
  Filter,
  FilterExcludingWhere,
  InclusionResolver,
  Where,
  DefaultCrudRepository,
} from '@loopback/repository';
import {mockData, mockDataArray} from './mockData';
import {MockModel} from './mockModel';

export class MockClass extends DefaultCrudRepository<
  MockModel,
  string | undefined,
  {}
> {
  entityClass: typeof Entity & {prototype: MockModel} = MockModel;
  inclusionResolvers: Map<string, InclusionResolver<MockModel, Entity>>;

  save(entity: DataObject<MockModel>, options?: AnyObject): Promise<MockModel> {
    throw new Error('Method not implemented.');
  }
  update(entity: DataObject<MockModel>, options?: AnyObject): Promise<void> {
    throw new Error('Method not implemented.');
  }
  delete(entity: DataObject<MockModel>, options?: AnyObject): Promise<void> {
    throw new Error('Method not implemented.');
  }
  findById(
    id: string | undefined,
    filter?: FilterExcludingWhere<MockModel>,
    options?: AnyObject,
  ): Promise<MockModel> {
    return new Promise(resolve => {
      const mockDataToReturn = Object.assign({}, mockData);
      resolve(mockDataToReturn);
    });
  }
  updateById(
    id: string | undefined,
    data: DataObject<MockModel>,
    options?: AnyObject,
  ): Promise<void> {
    mockClassMethodCall.updateById = true;

    if (data.id) {
      mockData.id = data.id;
    }
    if (data.itemName) {
      mockData.itemName = data.itemName;
    }
    if (data.description) {
      mockData.description = data.description;
    }

    return new Promise(resolve => {
      resolve();
    });
  }
  replaceById(
    id: string | undefined,
    data: DataObject<MockModel>,
    options?: AnyObject,
  ): Promise<void> {
    mockClassMethodCall.replaceById = true;

    if (data.id) {
      mockData.id = data.id;
    }
    if (data.itemName) {
      mockData.itemName = data.itemName;
    }
    if (data.description) {
      mockData.description = data.description;
    }

    return new Promise(resolve => {
      resolve();
    });
  }
  deleteById(id: string | undefined, options?: AnyObject): Promise<void> {
    mockClassMethodCall.deleteById = true;
    return new Promise(resolve => {
      resolve();
    });
  }
  exists(id: string | undefined, options?: AnyObject): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  create(
    dataObject: DataObject<MockModel>,
    options?: AnyObject,
  ): Promise<MockModel> {
    mockClassMethodCall.create = true;
    return new Promise(resolve => {
      resolve(mockData);
    });
  }
  createAll(
    dataObjects: DataObject<MockModel>[],
    options?: AnyObject,
  ): Promise<MockModel[]> {
    mockClassMethodCall.createAll = true;
    return new Promise(resolve => {
      resolve(mockDataArray);
    });
  }
  find(filter?: Filter<MockModel>, options?: AnyObject): Promise<MockModel[]> {
    return new Promise(resolve => {
      const mockDataArrayToReturn: MockModel[] = [];
      mockDataArray.forEach(data => {
        mockDataArrayToReturn.push(Object.assign({}, data));
      });
      resolve(mockDataArrayToReturn);
    });
  }
  updateAll(
    dataObject: DataObject<MockModel>,
    where?: Where<MockModel>,
    options?: AnyObject,
  ): Promise<Count> {
    mockClassMethodCall.updateAll = true;

    mockDataArray.forEach(data => {
      if (dataObject.id) {
        data.id = dataObject.id;
      }
      if (dataObject.itemName) {
        data.itemName = dataObject.itemName;
      }
      if (dataObject.description) {
        data.description = dataObject.description;
      }
    });
    return new Promise(resolve => {
      resolve({count: mockDataArray.length});
    });
  }
  deleteAll(where?: Where<MockModel>, options?: AnyObject): Promise<Count> {
    mockClassMethodCall.deleteAll = true;
    return new Promise(resolve => {
      resolve({count: mockDataArray.length});
    });
  }
  count(where?: Where<MockModel>, options?: AnyObject): Promise<Count> {
    throw new Error('Method not implemented.');
  }
}
export const mockClassMethodCall = {
  create: false,
  createAll: false,
  deleteById: false,
  deleteAll: false,
  updateById: false,
  replaceById: false,
  updateAll: false,
};
export function resetMethodCalls() {
  mockClassMethodCall.create = false;
  mockClassMethodCall.createAll = false;
  mockClassMethodCall.deleteById = false;
  mockClassMethodCall.deleteAll = false;
  mockClassMethodCall.updateById = false;
  mockClassMethodCall.replaceById = false;
  mockClassMethodCall.updateAll = false;
}
