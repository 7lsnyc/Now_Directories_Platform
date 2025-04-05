import { render, screen } from '@testing-library/react';
import HeaderPlatform from '@/components/platform/HeaderPlatform';

/**
 * Unit tests for the HeaderPlatform component
 * Tests the rendering of the logo/brand name and styling
 */
describe('HeaderPlatform', () => {
  it('renders the logo/brand name', () => {
    render(<HeaderPlatform />);
    expect(screen.getByText('Now Directories')).toBeInTheDocument();
  });

  it('has the correct styling including border', () => {
    const { container } = render(<HeaderPlatform />);
    const header = container.querySelector('header');
    expect(header).toHaveClass('border-b');
    expect(header).toHaveClass('border-gray-700');
  });

  it('is properly contained within a max-width container', () => {
    const { container } = render(<HeaderPlatform />);
    const innerDiv = container.querySelector('header > div');
    expect(innerDiv).toHaveClass('max-w-7xl');
    expect(innerDiv).toHaveClass('mx-auto');
  });
});
