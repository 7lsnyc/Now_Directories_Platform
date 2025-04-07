# Adding a New Directory to Now Directories Platform

This guide provides step-by-step instructions for adding a new directory to the Now Directories Platform. The architecture is designed to make this process simple with no code changes required - just database entries and domain configuration.

## Prerequisites

- Admin access to the Supabase dashboard
- Admin access to the Vercel dashboard (for domain configuration)
- A domain name for your new directory (e.g., healthinsurancenow.com)

## Step 1: Add Directory to Supabase

1. **Log in to the Supabase dashboard**
   - Go to [app.supabase.com](https://app.supabase.com) and sign in
   - Select the Now Directories project

2. **Add a new directory entry**
   - Navigate to the "Table editor" in the sidebar
   - Select the "directories" table
   - Click "Insert row" and add the following required fields:

   | Field                 | Description                                             | Example                   |
   |-----------------------|---------------------------------------------------------|---------------------------|
   | name                  | Display name of the directory                           | Health Insurance Now      |
   | directory_slug        | URL-friendly identifier (no spaces or special chars)    | healthinsurancenow        |
   | domain                | The custom domain for this directory                    | healthinsurancenow.com    |
   | description           | Brief description of the directory                      | Find health insurance...  |
   | icon_name             | Name of the icon to use (from lucide-react)             | HeartPulse                |
   | logo_url              | URL to the directory's logo (or null for text display)  | https://example.com/logo.png |
   | brand_color_primary   | Primary brand color (hex code)                          | #1e40af                   |
   | brand_color_secondary | Secondary brand color (hex code or null for default)    | #1e3a8a                   |
   | brand_color_accent    | Accent brand color (hex code or null for default)       | #f97316                   |
   | is_public             | Whether the directory is publicly visible               | true                      |
   | is_searchable         | Whether the directory appears in main platform search   | true                      |
   | is_active             | Whether the directory is active and accessible          | true                      |
   | priority              | Display order in platform homepage (lower = higher)     | 10                        |

3. **Click "Save" to create the directory record**

## Step 2: Configure Domain in Vercel

1. **Log in to the Vercel dashboard**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Select the Now Directories project

2. **Add the custom domain**
   - Navigate to "Settings" → "Domains"
   - Add your domain (e.g., healthinsurancenow.com)
   - Follow Vercel's instructions to verify domain ownership
   - Set up DNS records as instructed by Vercel

3. **Configure domain in your DNS provider**
   - Add the required DNS records (usually CNAME or A records)
   - Wait for DNS propagation (can take up to 24-48 hours)

## Step 3: Test the New Directory

1. **Verify database entry**
   - Confirm the directory is added correctly in Supabase
   - Ensure all required fields are populated

2. **Test the domain**
   - Once DNS has propagated, visit your domain
   - The directory should automatically load with the correct branding
   - Test navigation and basic functionality

3. **Verify the following are working**:
   - Custom branding (colors, logo)
   - Navigation links
   - Basic layout and content

## Troubleshooting

If the directory doesn't appear correctly, check these common issues:

- **Directory Not Found Error**: Verify the domain is correctly added in the Supabase directories table
- **Missing Branding**: Check that brand colors are properly formatted as hex codes (#RRGGBB)
- **Domain Not Working**: Confirm DNS settings are correct and have had time to propagate

## Next Steps

After adding the directory, you may want to:

1. **Add content**: Begin adding listings to the directory
2. **Configure SEO**: Update meta tags for better search visibility
3. **Set up analytics**: Track visits and usage patterns

---

For any issues or questions, please contact the platform administrator.
