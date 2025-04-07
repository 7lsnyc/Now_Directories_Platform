/**
 * Type declarations for Deno modules used in Supabase Edge Functions
 */

declare module 'https://deno.land/std@0.168.0/http/server.ts' {
  export interface ConnInfo {
    readonly localAddr: Deno.Addr;
    readonly remoteAddr: Deno.Addr;
  }

  export interface Handler {
    (request: Request, connInfo: ConnInfo): Response | Promise<Response>;
  }

  export interface ServeInit {
    port?: number;
    hostname?: string;
    handler: Handler;
    onError?: (error: unknown) => Response | Promise<Response>;
    signal?: AbortSignal;
  }

  export function serve(handler: Handler, options?: Omit<ServeInit, 'handler'>): void;
  export function serve(options: ServeInit): void;
}

declare module 'https://esm.sh/@supabase/supabase-js@2' {
  export interface SupabaseClientOptions {
    auth?: {
      autoRefreshToken?: boolean;
      persistSession?: boolean;
      detectSessionInUrl?: boolean;
    };
    global?: {
      fetch?: typeof fetch;
      headers?: Record<string, string>;
    };
    db?: {
      schema?: string;
    };
    realtime?: {
      channels?: {
        [key: string]: any;
      };
    };
  }

  export class SupabaseClient {
    constructor(supabaseUrl: string, supabaseKey: string, options?: SupabaseClientOptions);
    
    from(table: string): any;
    rpc(fn: string, params?: object): any;
    auth: {
      signIn(credentials: any): Promise<any>;
      signOut(): Promise<any>;
      session(): any;
    };
  }

  export function createClient(
    supabaseUrl: string,
    supabaseKey: string,
    options?: SupabaseClientOptions
  ): SupabaseClient;
}
