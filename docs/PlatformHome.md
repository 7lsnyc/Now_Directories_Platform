# Now Directories Platform Homepage

This document provides details about the aggregator homepage structure, components, and how to maintain or extend it.

## Structure and Components

The homepage is built with a clean, modular design that consists of these main components:

1. **Header** - Located in `app/page.tsx`, contains:
   - Logo and site name
   - Navigation links (About, Contact, For Investors)
   - Login/Signup button

2. **HeroSection** (`/components/platform/HeroSection.tsx`)
   - Main headline and promotional text
   - Establishes the value proposition of the platform

3. **Visual Divider** - A subtle divider with `border-t border-gray-700` styling

4. **Directories Grid** (`/components/platform/DirectoriesGrid.tsx`)
   - Section title "Our Directories"
   - Grid of directory cards for each service
   - Uses responsive grid layout (1 column on mobile, 2-3 on larger screens)

5. **FooterPlatform** (`/components/platform/FooterPlatform.tsx`)
   - Copyright and legal information
   - Navigation to key pages

## How to Add a New Directory Tile

To add a new directory to the homepage grid:

1. Edit `data/platform-directories.ts` to add a new directory object:

```typescript
{
  id: 'your-directory-slug',
  title: 'Your Directory Name',
  description: 'Brief description of the service',
  icon: 'FaIcon', // Icon from react-icons/fa
  url: '/directory/your-directory-slug',
  isNew: true, // Optional, displays "NEW" badge
  color: 'text-blue-500' // Optional, for icon color
}
```

2. No additional code changes are needed as the grid will automatically render the new directory card.

## Modifying Hero Content

To update the hero content:

1. Edit `/components/platform/HeroSection.tsx` to change:
   - Main heading text
   - Subheading text
   - Button text or links

## Theming and Colors

The homepage uses:
- **Background**: Black (`bg-black`) for the main container
- **Text**: White for primary content (`text-white`)
- **Dividers/Borders**: Dark gray (`border-gray-700`) for subtle separation
- **Accents**: The multi-tenant theming system applies throughout the site

To modify theme colors for specific directories, use the ThemeProvider component and update the directory config files to maintain consistent styling across all pages.

## Testing

The homepage has three main test suites:

1. Structure test (`renders the complete homepage structure`)
2. Navigation links test (`includes all required navigation links`)
3. Component order test (`has components in the correct sequential order`)

When updating components, ensure tests are modified to verify new functionality.
