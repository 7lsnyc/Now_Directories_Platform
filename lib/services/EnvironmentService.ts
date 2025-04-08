import { env as baseEnv, fetchClientEnv } from '../env';

/**
 * A more robust environment service that ensures variables are properly loaded
 * and validated before use in the application
 */
class EnvironmentService {
  private static instance: EnvironmentService;
  private isInitialized = false;
  private isClientSide = false;
  private isClientLoading = false;
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
    // Check if we're in a browser environment
    this.isClientSide = typeof window !== 'undefined';
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
    // Don't re-initialize if already done, unless it's a client-side 
    // initialization that hasn't completed async loading yet
    if (this.isInitialized && !(this.isClientSide && this.isClientLoading)) {
      return;
    }
    
    try {
      // Skip detailed validation during build
      if (this.isBuilding) {
        this.setPlaceholderValues('build');
        this.isInitialized = true;
        return;
      }

      // For client-side, we need to handle async loading differently
      if (this.isClientSide) {
        // First initialization - use safe temporary values and trigger async load
        if (!this.isClientLoading) {
          // Set temporary values that won't cause errors during initial render
          this.setPlaceholderValues('client');
          this.isClientLoading = true;
          this.isInitialized = true;
          
          // Asynchronously fetch and update the real values
          this.loadClientEnvironment();
          return;
        }
      }

      // Server-side initialization with full validation
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
      this.isClientLoading = false;
      
      if (this.values.debug) {
        console.log('Environment service initialized successfully');
      }
    } catch (error) {
      this.validationErrors.push(error instanceof Error ? error.message : 'Unknown validation error');
      console.error('Failed to initialize environment service:', error);
      
      // Even if validation fails on client-side, don't throw to avoid breaking the UI
      // Just use placeholder values
      if (this.isClientSide) {
        this.setPlaceholderValues('client-fallback');
        this.isInitialized = true;
        return;
      }
      
      throw error;
    }
  }
  
  /**
   * Asynchronously load client-side environment variables
   * and update the service values when they're available
   */
  private async loadClientEnvironment() {
    try {
      // Fetch environment variables from API
      const clientEnv = await fetchClientEnv();
      
      // Update values with real environment variables
      if (clientEnv.NEXT_PUBLIC_SUPABASE_URL) {
        this.values.supabase.url = clientEnv.NEXT_PUBLIC_SUPABASE_URL;
      }
      
      if (clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        this.values.supabase.anonKey = clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      }
      
      // Update non-critical values too
      if (clientEnv.DEFAULT_DIRECTORY_SLUG) {
        this.values.defaults.directorySlug = clientEnv.DEFAULT_DIRECTORY_SLUG;
      }
      
      // Mark loading as complete
      this.isClientLoading = false;
      
      if (this.values.debug) {
        console.log('Client environment variables loaded successfully');
      }
    } catch (error) {
      console.error('Failed to load client environment variables:', error);
      this.isClientLoading = false;
    }
  }
  
  /**
   * Set appropriate placeholder values based on context
   */
  private setPlaceholderValues(context: 'build' | 'client' | 'client-fallback') {
    // Use different placeholders for different contexts for easier debugging
    const contextPrefix = context === 'build' ? 'build-placeholder' : 
                          context === 'client' ? 'client-placeholder' : 'fallback-placeholder';
    
    this.values.supabase.url = `https://${contextPrefix}.supabase.co`;
    this.values.supabase.anonKey = `${contextPrefix}-anon-key`;
    this.values.supabase.serviceRoleKey = `${contextPrefix}-service-key`;
    this.values.defaults.directorySlug = 'notaryfindernow';
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
    // During build or client-side, pretend there are no errors
    if (this.isBuilding || this.isClientSide) return false;
    return this.validationErrors.length > 0;
  }
  
  /**
   * Get any validation errors that occurred
   */
  public getErrors(): string[] {
    // During build or client-side, return empty errors
    if (this.isBuilding || this.isClientSide) return [];
    return [...this.validationErrors];
  }
  
  /**
   * Force a refresh of environment variables
   * Useful when environment might have changed during runtime
   */
  public refresh(): void {
    if (this.isClientSide) {
      // For client-side, just trigger async loading again
      this.isClientLoading = true;
      this.loadClientEnvironment();
    } else {
      // For server-side, reinitialize synchronously
      this.isInitialized = false;
      this.validationErrors = [];
      this.initialize();
    }
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
