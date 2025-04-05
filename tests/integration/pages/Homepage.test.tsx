import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FaClock } from 'react-icons/fa';

// Mock Next.js components
jest.mock('next/link', () => {
  return {
    __esModule: true,
    default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
      <a href={href} className={className} data-testid="mock-link">
        {children}
      </a>
    ),
  };
});

// Create a custom render for the homepage with mocked components
const renderHomepage = () => {
  // Import the real component
  const HomePage = require('@/app/page').default;
  
  return render(<HomePage />);
};

// Mock the homepage components to provide test hooks and simplify testing
jest.mock('@/components/platform/HeroSection', () => () => (
  <section data-testid="hero-section">
    <h1>Curated Directories for Life's Emergencies</h1>
    <p>Now Directories is a portfolio of profitable, high-intent local directories</p>
  </section>
));

jest.mock('@/components/platform/DirectoriesGrid', () => () => (
  <div data-testid="directories-grid">
    <div data-testid="directory-card">Notary Finder</div>
    <div data-testid="directory-card">Emergency Dentists</div>
  </div>
));

jest.mock('@/components/platform/FooterPlatform', () => () => (
  <footer data-testid="footer-component">
    Footer content
  </footer>
));

jest.mock('react-icons/fa', () => ({
  FaClock: () => <div data-testid="clock-icon" />,
}));

describe('Homepage', () => {
  it('renders the complete homepage structure', () => {
    const { container } = renderHomepage();

    // Verify basic structure
    expect(screen.getByText('Now Directories')).toBeInTheDocument();
    expect(screen.getByText('Login / Signup')).toBeInTheDocument();
    expect(screen.getByText("Curated Directories for Life's Emergencies")).toBeInTheDocument();
    expect(screen.getByText('Our Directories')).toBeInTheDocument();
    
    // Verify the divider exists with correct classes
    const divider = container.querySelector('.border-t.border-gray-700');
    expect(divider).toBeInTheDocument();
    
    // Verify that DirectoriesGrid component is rendered
    expect(screen.getByTestId('directories-grid')).toBeInTheDocument();
    
    // Verify that FooterPlatform component is rendered
    expect(screen.getByTestId('footer-component')).toBeInTheDocument();
  });
  
  it('includes all required navigation links', () => {
    renderHomepage();
    
    // Check for header navigation links
    const aboutLink = screen.getByText('About');
    const contactLink = screen.getByText('Contact');
    const investorsLink = screen.getByText('For Investors');
    const loginLink = screen.getByText('Login / Signup');
    
    expect(aboutLink).toBeInTheDocument();
    expect(contactLink).toBeInTheDocument();
    expect(investorsLink).toBeInTheDocument();
    expect(loginLink).toBeInTheDocument();
    
    // Verify links have the correct destinations
    expect(aboutLink.closest('a')).toHaveAttribute('href', '/about');
    expect(contactLink.closest('a')).toHaveAttribute('href', '/contact');
    expect(investorsLink.closest('a')).toHaveAttribute('href', '/for-investors');
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });
  
  it('has components in the correct sequential order', () => {
    const { container } = renderHomepage();
    
    // Check structural hierarchy - elements should appear in this order:
    // 1. Header (with Nav)
    // 2. Hero Section
    // 3. Divider
    // 4. Directories Section (with heading)
    // 5. Footer
    
    const header = container.querySelector('header');
    const heroSection = screen.getByTestId('hero-section');
    const divider = container.querySelector('.border-t.border-gray-700');
    const directoriesSection = screen.getByText('Our Directories').closest('section');
    const footer = screen.getByTestId('footer-component');
    
    // All elements should exist
    expect(header).toBeInTheDocument();
    expect(heroSection).toBeInTheDocument();
    expect(divider).toBeInTheDocument();
    expect(directoriesSection).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
    
    // Now check their order (using compareDocumentPosition)
    if (header && heroSection && divider && directoriesSection && footer) {
      // Header comes before hero
      expect(header.compareDocumentPosition(heroSection) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      
      // Hero comes before divider
      expect(heroSection.compareDocumentPosition(divider) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      
      // Divider comes before directories section
      expect(divider.compareDocumentPosition(directoriesSection) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      
      // Directories section comes before footer
      expect(directoriesSection.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
  });
});
