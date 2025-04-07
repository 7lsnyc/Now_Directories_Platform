import { render, screen } from '@testing-library/react';
import DirectoryNotFoundPage from '../../app/directory-not-found/page';

describe('Directory Not Found Page', () => {
  it('renders the not found message and link to main platform', () => {
    render(<DirectoryNotFoundPage />);
    
    // Check for the header text
    expect(screen.getByText('Directory Not Found')).toBeInTheDocument();
    
    // Check for the explanation message
    expect(
      screen.getByText("Sorry, we couldn't find a directory associated with this domain.")
    ).toBeInTheDocument();
    
    // Check for the link back to nowdirectories.com
    const link = screen.getByText('Visit Now Directories');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', 'https://nowdirectories.com');
  });
});
