import { render, screen } from '@testing-library/react';
import HeroSection from '@/components/platform/HeroSection';

/**
 * Unit tests for the HeroSection component
 * Tests the rendering of the headline, description, and CTA button
 */
describe('HeroSection', () => {
  it('renders the correct headline', () => {
    render(<HeroSection />);
    expect(screen.getByRole('heading', { 
      name: "Curated Directories for Life's Emergencies" 
    })).toBeInTheDocument();
  });

  it('renders the description text', () => {
    render(<HeroSection />);
    expect(screen.getByText(/Now Directories is a portfolio/i)).toBeInTheDocument();
  });

  it('renders a working CTA button', () => {
    render(<HeroSection />);
    
    const ctaButton = screen.getByRole('link', { name: /contact us/i });
    expect(ctaButton).toHaveAttribute('href', '/contact');
    expect(ctaButton).toHaveClass('bg-white');
    expect(ctaButton).toHaveClass('text-black');
  });

  it('has a responsive layout with proper text alignment', () => {
    const { container } = render(<HeroSection />);
    const section = container.querySelector('section');
    const contentDiv = container.querySelector('section > div');
    
    expect(section).toHaveClass('w-full');
    expect(contentDiv).toHaveClass('text-center');
    expect(contentDiv).toHaveClass('max-w-5xl');
    expect(contentDiv).toHaveClass('mx-auto');
  });
});
