/** Matches backend envelope: { status: number, message: string, data: T } */
export function successEnvelope<T>(data: T, message = "OK", status = 200) {
  return { status, message, data };
}

export function errorEnvelope(message: string, status = 400) {
  return { status, message, data: null };
}
