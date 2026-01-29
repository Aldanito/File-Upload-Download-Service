/**
 * Runs an async function in the background without awaiting.
 * Errors are logged and not rethrown.
 */
export function runAsync<T>(fn: () => Promise<T>): void {
  Promise.resolve()
    .then(fn)
    .catch((err) => {
      console.error("[asyncTasks]", err);
    });
}
