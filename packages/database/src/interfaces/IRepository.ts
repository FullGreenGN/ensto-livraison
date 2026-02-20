export interface IBaseRepository<T, CreateInput, UpdateInput, ID = number> {
  create(data: CreateInput): Promise<T>;
  findAll(): Promise<T[]>;
  findById(id: ID): Promise<T | null>;
  update(id: ID, data: UpdateInput): Promise<T>;
  delete(id: ID): Promise<T>;
}

