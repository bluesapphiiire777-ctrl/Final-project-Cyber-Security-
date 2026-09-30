import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || "mongodb+srv://kaig05463_db_user:uW1SqvJ4N7J2kOfq@database.lffgwdo.mongodb.net/?appName=Database";
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 3000,
  socketTimeoutMS: 15000,
};

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient | null> | null = null;

declare global {
  var _mongoClientPromise: Promise<MongoClient | null> | undefined;
  var _inMemoryStore: Map<string, any[]> | undefined;
}

if (!global._inMemoryStore) {
  global._inMemoryStore = new Map<string, any[]>();
}

// In-Memory fallback implementation to guarantee zero downtime
function matchFilter(doc: any, filter: any): boolean {
  if (!filter || Object.keys(filter).length === 0) return true;

  for (const key of Object.keys(filter)) {
    if (key === '$or' && Array.isArray(filter.$or)) {
      const orMatches = filter.$or.some((subFilter: any) => matchFilter(doc, subFilter));
      if (!orMatches) return false;
      continue;
    }

    const expected = filter[key];
    const actual = doc[key];

    if (expected && typeof expected === 'object' && expected.$regex) {
      const reg = new RegExp(expected.$regex, expected.$options || 'i');
      if (!reg.test(String(actual || ''))) return false;
      continue;
    }

    if (actual !== expected) {
      return false;
    }
  }
  return true;
}

class InMemoryCollection {
  private name: string;

  constructor(name: string) {
    this.name = name;
    if (!global._inMemoryStore!.has(name)) {
      global._inMemoryStore!.set(name, []);
    }
  }

  private get docs(): any[] {
    return global._inMemoryStore!.get(this.name) || [];
  }

  private set docs(val: any[]) {
    global._inMemoryStore!.set(this.name, val);
  }

  async createIndex() {
    return this.name;
  }

  async countDocuments(filter: any = {}): Promise<number> {
    return this.docs.filter(d => matchFilter(d, filter)).length;
  }

  async findOne(filter: any = {}): Promise<any | null> {
    const found = this.docs.find(d => matchFilter(d, filter));
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  async insertOne(doc: any): Promise<{ insertedId: string }> {
    const insertedId = doc._id || doc.id || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newDoc = { ...doc, _id: insertedId };
    this.docs = [...this.docs, newDoc];
    return { insertedId };
  }

  async insertMany(docArray: any[]): Promise<{ insertedCount: number }> {
    const newDocs = docArray.map(doc => ({
      ...doc,
      _id: doc._id || doc.id || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    }));
    this.docs = [...this.docs, ...newDocs];
    return { insertedCount: newDocs.length };
  }

  async updateOne(filter: any, update: any, options?: { upsert?: boolean }): Promise<{ matchedCount: number; modifiedCount: number }> {
    const idx = this.docs.findIndex(d => matchFilter(d, filter));
    if (idx !== -1) {
      const current = this.docs[idx];
      const updated = { ...current };
      if (update.$set) {
        Object.assign(updated, update.$set);
      } else {
        Object.assign(updated, update);
      }
      this.docs[idx] = updated;
      return { matchedCount: 1, modifiedCount: 1 };
    } else if (options?.upsert) {
      const newDoc = { ...(filter || {}), ...(update.$set || update) };
      await this.insertOne(newDoc);
      return { matchedCount: 0, modifiedCount: 1 };
    }
    return { matchedCount: 0, modifiedCount: 0 };
  }

  async updateMany(filter: any, update: any): Promise<{ matchedCount: number; modifiedCount: number }> {
    let count = 0;
    this.docs = this.docs.map(d => {
      if (matchFilter(d, filter)) {
        count++;
        const updated = { ...d };
        if (update.$set) Object.assign(updated, update.$set);
        else Object.assign(updated, update);
        return updated;
      }
      return d;
    });
    return { matchedCount: count, modifiedCount: count };
  }

  async deleteOne(filter: any): Promise<{ deletedCount: number }> {
    const idx = this.docs.findIndex(d => matchFilter(d, filter));
    if (idx !== -1) {
      this.docs.splice(idx, 1);
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  }

  find(filter: any = {}, _projection?: any) {
    let results = this.docs.filter(d => matchFilter(d, filter));
    let sortFn: ((a: any, b: any) => number) | null = null;
    let limitNum: number | null = null;

    const cursor = {
      sort(sortObj: any) {
        const key = Object.keys(sortObj)[0];
        const dir = sortObj[key];
        sortFn = (a: any, b: any) => {
          const aVal = a[key] instanceof Date ? a[key].getTime() : a[key];
          const bVal = b[key] instanceof Date ? b[key].getTime() : b[key];
          if (aVal < bVal) return dir === 1 ? -1 : 1;
          if (aVal > bVal) return dir === 1 ? 1 : -1;
          return 0;
        };
        return cursor;
      },
      limit(num: number) {
        limitNum = num;
        return cursor;
      },
      async toArray() {
        let copy = [...results];
        if (sortFn) {
          copy.sort(sortFn);
        }
        if (limitNum !== null) {
          copy = copy.slice(0, limitNum);
        }
        return JSON.parse(JSON.stringify(copy));
      },
    };

    return cursor;
  }
}

class InMemoryDb {
  collection(name: string) {
    return new InMemoryCollection(name);
  }
}

const inMemoryDbInstance = new InMemoryDb();

if (!global._mongoClientPromise) {
  try {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect()
      .then((c) => {
        console.log("Connected successfully to MongoDB Atlas.");
        return c;
      })
      .catch((err) => {
        console.warn("MongoDB Atlas connection unavailable, seamlessly activating in-memory persistence layer:", err.message);
        return null;
      });
  } catch (err: any) {
    console.warn("MongoDB client initialization skipped, using resilient in-memory storage:", err.message);
    global._mongoClientPromise = Promise.resolve(null);
  }
}

clientPromise = global._mongoClientPromise;

export async function getDb(dbName = "fip_forensics"): Promise<any> {
  try {
    const c = await clientPromise;
    if (c) {
      return c.db(dbName);
    }
  } catch (err) {
    console.warn("Fallback to in-memory DB:", err);
  }
  return inMemoryDbInstance;
}

export default clientPromise;
