/**
 * Redis Mock for Testing
 * Simulates Redis behavior in-memory
 */

class RedisMock {
  constructor() {
    this.store = new Map();
    this.expirations = new Map();
  }

  async get(key) {
    // Check if key has expired
    if (this.expirations.has(key)) {
      const expiresAt = this.expirations.get(key);
      if (Date.now() > expiresAt) {
        this.store.delete(key);
        this.expirations.delete(key);
        return null;
      }
    }
    return this.store.get(key) || null;
  }

  async set(key, value) {
    this.store.set(key, value);
    return 'OK';
  }

  async setex(key, seconds, value) {
    this.store.set(key, value);
    this.expirations.set(key, Date.now() + seconds * 1000);
    return 'OK';
  }

  async del(key) {
    const existed = this.store.has(key);
    this.store.delete(key);
    this.expirations.delete(key);
    return existed ? 1 : 0;
  }

  async exists(key) {
    return this.store.has(key) ? 1 : 0;
  }

  async ttl(key) {
    if (!this.expirations.has(key)) {
      return -1;
    }
    const expiresAt = this.expirations.get(key);
    const ttl = Math.floor((expiresAt - Date.now()) / 1000);
    return ttl > 0 ? ttl : -2;
  }

  async flushall() {
    this.store.clear();
    this.expirations.clear();
    return 'OK';
  }

  async quit() {
    return 'OK';
  }

  async disconnect() {
    return 'OK';
  }

  // Redis sorted set operations
  async zadd(key, score, member) {
    let set = this.store.get(key);
    if (!set) {
      set = new Map();
      this.store.set(key, set);
    }
    set.set(member, score);
    return 1;
  }

  async zrange(key, start, stop, withScores = false) {
    const set = this.store.get(key);
    if (!set) return [];

    const entries = Array.from(set.entries()).sort((a, b) => a[1] - b[1]);
    const result = entries.slice(start, stop === -1 ? undefined : stop + 1);

    if (withScores) {
      return result.flatMap(([member, score]) => [member, score]);
    }
    return result.map(([member]) => member);
  }

  async zrevrange(key, start, stop, withScores = false) {
    const set = this.store.get(key);
    if (!set) return [];

    const entries = Array.from(set.entries()).sort((a, b) => b[1] - a[1]);
    const result = entries.slice(start, stop === -1 ? undefined : stop + 1);

    if (withScores) {
      return result.flatMap(([member, score]) => [member, score]);
    }
    return result.map(([member]) => member);
  }

  async zscore(key, member) {
    const set = this.store.get(key);
    return set?.get(member) || null;
  }

  // Hash operations
  async hset(key, field, value) {
    let hash = this.store.get(key);
    if (!hash) {
      hash = new Map();
      this.store.set(key, hash);
    }
    hash.set(field, value);
    return 1;
  }

  async hget(key, field) {
    const hash = this.store.get(key);
    return hash?.get(field) || null;
  }

  async hgetall(key) {
    const hash = this.store.get(key);
    if (!hash) return {};

    const result = {};
    for (const [field, value] of hash.entries()) {
      result[field] = value;
    }
    return result;
  }
}

export function createRedisMock() {
  return new RedisMock();
}
