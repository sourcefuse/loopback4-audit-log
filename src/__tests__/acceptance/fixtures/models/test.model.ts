import {Entity, model, property} from '@loopback/repository';

@model()
export class TestModel extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  itemName: string;

  @property({
    type: 'string',
    required: true,
  })
  description: string;

  constructor(data?: Partial<TestModel>) {
    super(data);
  }
}

export interface TestModelRelations {
  // describe navigational properties here
}

export type TestModelWithRelations = TestModel & TestModelRelations;
