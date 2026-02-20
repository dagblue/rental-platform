export interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findAll(filter?: any): Promise<T[]>;
  create(data: any): Promise<T>;
  update(id: string, data: any): Promise<T>;
  delete(id: string): Promise<boolean>;
}

export class InMemoryRepository<T extends { id: string }> implements Repository<T> {
  protected store: Map<string, T> = new Map();

  async findById(id: string): Promise<T | null> {
    return this.store.get(id) || null;
  }

  async findAll(filter?: any): Promise<T[]> {
    let results = Array.from(this.store.values());
    if (filter) {
      // Simple filtering - can be extended
      results = results.filter(item => {
        return Object.entries(filter).every(([key, value]) => 
          (item as any)[key] === value
        );
      });
    }
    return results;
  }

  async create(data: any): Promise<T> {
    const id = data.id || `temp-${Date.now()}-${Math.random()}`;
    const item = { ...data, id } as T;
    this.store.set(id, item);
    return item;
  }

  async update(id: string, data: any): Promise<T> {
    const existing = await this.findById(id);
    if (!existing) throw new Error('Not found');
    const updated = { ...existing, ...data };
    this.store.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}
