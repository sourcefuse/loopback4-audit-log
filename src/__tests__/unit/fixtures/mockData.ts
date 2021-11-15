import {MockModel} from './mockModel';

export const mockData: MockModel = {
  id: 'testId',
  itemName: 'testItemName',
  description: 'testDescription',
  getId: function () {
    return this.id;
  },
  getIdObject: function (): Object {
    return {id: this.id};
  },
  toJSON: function (): Object {
    return {
      id: this.id,
      itemName: this.itemName,
      description: this.description,
    };
  },
  toObject: function (): Object {
    return {
      id: this.id,
      itemName: this.itemName,
      description: this.description,
    };
  },
};

export const mockDataArray: MockModel[] = [
  {
    id: 'testId1',
    itemName: 'testItemName1',
    description: 'testDescription1',
    getId: function () {
      return this.id;
    },
    getIdObject: function (): Object {
      return {id: this.id};
    },
    toJSON: function (): Object {
      return {
        id: this.id,
        itemName: this.itemName,
        description: this.description,
      };
    },
    toObject: function (): Object {
      return {
        id: this.id,
        itemName: this.itemName,
        description: this.description,
      };
    },
  },
  {
    id: 'testId2',
    itemName: 'testItemName2',
    description: 'testDescription2',
    getId: function () {
      return this.id;
    },
    getIdObject: function (): Object {
      return {id: this.id};
    },
    toJSON: function (): Object {
      return {
        id: this.id,
        itemName: this.itemName,
        description: this.description,
      };
    },
    toObject: function (): Object {
      return {
        id: this.id,
        itemName: this.itemName,
        description: this.description,
      };
    },
  },
  {
    id: 'testId3',
    itemName: 'testItemName3',
    description: 'testDescription3',
    getId: function () {
      return this.id;
    },
    getIdObject: function (): Object {
      return {id: this.id};
    },
    toJSON: function (): Object {
      return {
        id: this.id,
        itemName: this.itemName,
        description: this.description,
      };
    },
    toObject: function (): Object {
      return {
        id: this.id,
        itemName: this.itemName,
        description: this.description,
      };
    },
  },
];

export function resetMockData() {
  mockData.id = 'testId';
  mockData.itemName = 'testItemName';
  mockData.description = 'testItemDescription';
  mockDataArray.forEach((data, index) => {
    data.id = 'testId' + (index + 1);
    data.itemName = 'testItemName' + (index + 1);
    data.description = 'testItemDescription' + (index + 1);
  });
}
