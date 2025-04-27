export function randomId(length = 12) {
  return Math.random().toString(36).substring(2, length+2);
}