function serializeValue(value) {
  if (value === undefined) return null;
  if (value === null) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value?.toDate === 'function') return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(serializeValue);
  if (typeof value === 'object') {
    const out = {};
    for (const [key, item] of Object.entries(value)) out[key] = serializeValue(item);
    return out;
  }
  return value;
}

export function serializeFirestoreData(data) {
  return serializeValue(data);
}

export function serializeFirestoreDoc(snapshot) {
  if (!snapshot?.exists) return null;
  return serializeValue({ id: snapshot.id, ...snapshot.data() });
}
