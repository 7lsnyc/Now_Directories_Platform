import { render, screen } from '@testing-library/react';
import FooterPlatform from '@/components/platform/FooterPlatform';

/**
 * Unit tests for the FooterPlatform component
 * Tests rendering of footer elements, navigation links, styling, and copyright notice
 */
describe('FooterPlatform', () => {
  it('renders the correct tagline', () => {
    render(<FooterPlatform />);
    expect(screen.getByText('Your guide to urgent local services')).toBeInTheDocument();
  });

  it('renders the company name and logo', () => {
    render(<FooterPlatform />);
    expect(screen.getByText('Now Directories')).toBeInTheDocument();
    // Check for the clock icon (FaClock from react-icons)
    const { container } = render(<FooterPlatform />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders all navigation sections', () => {
    render(<FooterPlatform />);
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('Resources')).toBeInTheDocument();
    expect(screen.getByText('Legal')).toBeInTheDocument();
  });

  it('has all required links', () => {
    render(<FooterPlatform />);
    // Sample of important links to check
    const links = [
      { text: 'About Us', href: '/about' },
      { text: 'Contact', href: '/contact' },
      { text: 'Privacy Policy', href: '/privacy' },
      { text: 'Terms of Service', href: '/terms' }
    ];
    
    links.forEach(link => {
      const element = screen.getByRole('link', { name: link.text });
      expect(element).toHaveAttribute('href', link.href);
    });
  });

  it('has the correct styling including border', () => {
    const { container } = render(<FooterPlatform />);
    const footer = container.querySelector('footer');
    expect(footer).toHaveClass('bg-black');
    expect(footer).toHaveClass('text-gray-300');
    expect(footer).toHaveClass('border-t');
    expect(footer).toHaveClass('border-gray-700');
  });

  it('renders the copyright notice with current year', () => {
    render(<FooterPlatform />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${currentYear} Now Directories`))).toBeInTheDocument();
  });

  it('has a responsive grid layout', () => {
    const { container } = render(<FooterPlatform />);
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('md:grid-cols-4');
  });
});
