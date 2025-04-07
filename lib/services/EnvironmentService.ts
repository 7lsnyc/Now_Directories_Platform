import { env as baseEnv } from '../env';

/**
 * A more robust environment service that ensures variables are properly loaded
 * and validated before use in the application
 */
class EnvironmentService {
  private static instance: EnvironmentService;
  private isInitialized = false;
  private validationErrors: string[] = [];
  
  // Server-validated environment values
  private values = {
    supabase: {
      url: '',
      anonKey: '',
      serviceRoleKey: ''
    },
    defaults: {
      directorySlug: 'notaryfindernow'
    },
    analytics: {
      enabled: false,
      googleAnalyticsId: ''
    },
    debug: false
  };

  // Detect if we're in a build environment where we need to use fallbacks
  private isBuilding = process.env.VERCEL_ENV === 'production' && process.env.NEXT_PUBLIC_SUPABASE_URL === undefined;
  
  private constructor() {
    // Private constructor for singleton
  }
  
  public static getInstance(): EnvironmentService {
    if (!EnvironmentService.instance) {
      EnvironmentService.instance = new EnvironmentService();
    }
    return EnvironmentService.instance;
  }
  
  /**
   * Initialize environment values with validation
   * This should be called early in the app lifecycle
   */
  public initialize() {
    if (this.isInitialized) return;
    
    try {
      // Skip detailed validation during build
      if (this.isBuilding) {
        this.values.supabase.url = 'https://placeholder-during-build.supabase.co';
        this.values.supabase.anonKey = 'placeholder-during-build';
        this.values.supabase.serviceRoleKey = 'placeholder-during-build';
        this.values.defaults.directorySlug = 'notaryfindernow';
        this.isInitialized = true;
        return;
      }

      // Load and validate critical Supabase variables
      this.values.supabase.url = this.validateUrl(baseEnv.NEXT_PUBLIC_SUPABASE_URL);
      this.values.supabase.anonKey = this.validateApiKey(baseEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      this.values.supabase.serviceRoleKey = this.validateApiKey(baseEnv.SUPABASE_SERVICE_ROLE_KEY);
      
      // Load other configuration
      this.values.defaults.directorySlug = baseEnv.DEFAULT_DIRECTORY_SLUG || 'notaryfindernow';
      this.values.analytics.enabled = baseEnv.ENABLE_ANALYTICS || false;
      this.values.analytics.googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS || '';
      this.values.debug = baseEnv.DEBUG_MODE || false;
      
      this.isInitialized = true;
      
      if (this.values.debug) {
        console.log('Environment service initialized successfully');
      }
    } catch (error) {
      this.validationErrors.push(error instanceof Error ? error.message : 'Unknown validation error');
      console.error('Failed to initialize environment service:', error);
      throw error;
    }
  }
  
  /**
   * Get the current environment values, initializing if needed
   */
  public getValues() {
    if (!this.isInitialized) {
      this.initialize();
    }
    return this.values;
  }
  
  /**
   * Check if there were any errors during initialization
   */
  public hasErrors(): boolean {
    // During build, pretend there are no errors
    if (this.isBuilding) return false;
    return this.validationErrors.length > 0;
  }
  
  /**
   * Get any validation errors that occurred
   */
  public getErrors(): string[] {
    // During build, return empty errors
    if (this.isBuilding) return [];
    return [...this.validationErrors];
  }
  
  /**
   * Force a refresh of environment variables
   * Useful when environment might have changed during runtime
   */
  public refresh(): void {
    this.isInitialized = false;
    this.validationErrors = [];
    this.initialize();
  }
  
  // Validation helpers
  private validateUrl(url: string): string {
    if (!url) {
      throw new Error('Missing URL');
    }
    
    // Check for development placeholder values from env.ts
    if (url.startsWith('dev-placeholder-') || url.startsWith('build-placeholder-')) {
      throw new Error('Using placeholder for URL');
    }
    
    try {
      new URL(url);
      return url;
    } catch (error) {
      throw new Error(`Invalid URL: ${url}`);
    }
  }
  
  private validateApiKey(key: string): string {
    if (!key || key.length < 10) {
      throw new Error('Invalid API key: Key is too short or missing');
    }
    
    // Check for placeholder values from env.ts
    if (key.startsWith('dev-placeholder-') || key.startsWith('build-placeholder-')) {
      throw new Error('Using placeholder for API key');
    }
    
    return key;
  }
}

export const environmentService = EnvironmentService.getInstance();
