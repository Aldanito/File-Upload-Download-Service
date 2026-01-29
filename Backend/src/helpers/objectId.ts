const OBJECT_ID_HEX_LENGTH = 24;

export function isValidObjectId(id: string): boolean {
  if (typeof id !== "string" || id.length !== OBJECT_ID_HEX_LENGTH) return false;
  return /^[a-f0-9]{24}$/i.test(id);
}
