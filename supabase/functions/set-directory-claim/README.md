# Directory Slug JWT Claim Edge Function

This Supabase Edge Function adds the `directory_slug` claim to user JWTs, which enables the Row Level Security (RLS) policies to filter data by directory.

## Development Note

This function is designed to run in the Deno runtime environment provided by Supabase Edge Functions. TypeScript errors related to Deno imports can be ignored in your IDE as they will be resolved when deployed to Supabase.

## Deployment

Deploy this function to your Supabase project using the Supabase CLI:

```bash
supabase functions deploy set-directory-claim
```

## Usage

The function expects a POST request with the following JSON body:

```json
{
  "token": "user-jwt-token",
  "directorySlug": "notary"
}
```

It will update the user's metadata to include the `directory_slug` claim, which will be included in future JWTs issued to that user.

## Security

This function requires the service role key to update user metadata, so it should only be called from secure server-side contexts.
