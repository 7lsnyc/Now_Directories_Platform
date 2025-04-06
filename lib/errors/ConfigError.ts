/**
 * CustomError for configuration and environment variable issues
 * This helps distinguish these errors for proper handling in the error boundary
 */
export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

export default ConfigError;
