// This is a simple singleton to manage one-time warnings across the application.
// It ensures that certain warnings are only shown once per session, even with HMR.

// Define a global symbol to ensure uniqueness and avoid name collisions.
declare global {
  var __warningManagerInstance: WarningManager | undefined;
}

class WarningManager {
  private warningsShown: Set<string> = new Set();

  public hasBeenShown(key: string): boolean {
    return this.warningsShown.has(key);
  }

  public setAsShown(key: string): void {
    this.warningsShown.add(key);
  }
}

// In development, reuse the instance across hot reloads.
if (process.env.NODE_ENV === 'development') {
  if (!global.__warningManagerInstance) {
    global.__warningManagerInstance = new WarningManager();
  }
  // In production, a new instance is created per server instance, which is fine.
} else {
  if (!global.__warningManagerInstance) {
    global.__warningManagerInstance = new WarningManager();
  }
}

export const warningManager = global.__warningManagerInstance;
