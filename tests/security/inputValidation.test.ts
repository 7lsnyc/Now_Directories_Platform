import { validateInput } from '../../lib/security/securityMiddleware';

describe('Security Input Validation Tests', () => {
  
  test('Should reject SQL injection attempts', () => {
    const maliciousInputs = [
      "'; DROP TABLE directories; --",
      "notaryfinder' OR '1'='1",
      "SELECT * FROM users",
      "<script>alert('xss')</script>",
      "javascript:alert(1)"
    ];
    
    maliciousInputs.forEach(input => {
      expect(validateInput(input)).toBeNull();
    });
  });
  
  test('Should validate proper domains', () => {
    expect(validateInput('example.com', 'domain')).toBe('example.com');
    expect(validateInput('sub-domain.example.com', 'domain')).toBe('sub-domain.example.com');
    expect(validateInput('invalid..domain', 'domain')).toBeNull();
    expect(validateInput('domain with spaces.com', 'domain')).toBeNull();
  });
  
  test('Should validate proper slugs', () => {
    expect(validateInput('valid-slug', 'slug')).toBe('valid-slug');
    expect(validateInput('valid_slug_123', 'slug')).toBe('valid_slug_123');
    expect(validateInput('invalid slug', 'slug')).toBeNull();
    expect(validateInput('invalid$char', 'slug')).toBeNull();
  });
  
  test('Should allow safe generic inputs', () => {
    expect(validateInput('This is safe text.')).toBe('This is safe text.');
    expect(validateInput('   Text with whitespace   ')).toBe('Text with whitespace');
  });
});
