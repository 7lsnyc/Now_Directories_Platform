import { render, screen } from '@testing-library/react';
import DirectoryHeader from '../../components/directory/DirectoryHeader';
import DirectoryFooter from '../../components/directory/DirectoryFooter';
import { Directory } from '@/types/directory';

// Mock directory data for testing
const mockDirectory: Directory = {
  id: '123',
  name: 'Test Directory',
  directory_slug: 'test-directory',
  domain: 'testdirectory.com',
  icon_name: 'Building',
  logo_url: null,
  icon_url: null,
  brand_color_primary: '#1a73e8',
  brand_color_secondary: '#4285f4',
  brand_color_accent: '#ea4335',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  description: 'A test directory for development',
  is_public: true,
  is_searchable: true,
  is_active: true,
  priority: 1
};

describe('Directory Components Accessibility', () => {
  test('DirectoryHeader has proper navigation accessibility attributes', () => {
    render(<DirectoryHeader directory={mockDirectory} />);
    
    // Check if navigation has appropriate aria-label
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Main Navigation');
    
    // Check if links have appropriate aria-labels
    expect(screen.getByText('Home')).toHaveAttribute('aria-label', 'Go to home page');
    expect(screen.getByText('Search')).toHaveAttribute('aria-label', 'Go to search page');
    
    // Ensure links are properly focusable (keyboard navigable)
    const homeLink = screen.getByText('Home').closest('a');
    const searchLink = screen.getByText('Search').closest('a');
    
    expect(homeLink).toHaveAttribute('href', '/');
    expect(searchLink).toHaveAttribute('href', '/search');
  });
  
  test('DirectoryFooter has proper accessibility attributes', () => {
    render(<DirectoryFooter directory={mockDirectory} />);
    
    // Check if footer has appropriate aria-label
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveAttribute('aria-label', 'Site Footer');
    
    // Check if links have appropriate accessibility attributes for the internal link
    const link = screen.getByText('Now Directories');
    expect(link).toHaveAttribute('aria-label', 'Visit Now Directories platform home page');
    // No longer expecting external link attributes
    expect(link).not.toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).not.toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('href', '/');
  });
});
