/**
 * Tests for the component registry
 * 
 * These tests verify that the component registry correctly selects components
 * based on directory features, ensuring that the platform can scale to
 * support multiple directories without hardcoded slug checks.
 */

import { getSearchFormComponent, getListWrapperComponent } from '@/lib/registry/componentRegistry';
import { Directory } from '@/types/directory';

// Mock directory data for testing
const createMockDirectory = (slug: string, features: string[]): Directory => ({
  id: `dir-${slug}`,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  name: `${slug.charAt(0).toUpperCase() + slug.slice(1).replace('findernow', '')} Finder Now`,
  directory_slug: slug,
  domain: `${slug}.com`,
  description: `Description for ${slug}`,
  icon_name: 'Search',
  logo_url: null,
  icon_url: null,
  brand_color_primary: '#1e40af',
  brand_color_secondary: '#1e3a8a',
  brand_color_accent: '#f97316',
  is_public: true,
  is_searchable: true,
  is_active: true,
  priority: 10,
  features
});

// Mock dynamic imports
jest.mock('next/dynamic', () => {
  return () => {
    return function MockComponent() {
      return null;
    };
  };
});

describe('Component Registry', () => {
  let notaryDirectory: Directory;
  let plumberDirectory: Directory;
  let lawyerDirectory: Directory;
  let emptyDirectory: Directory;

  beforeEach(() => {
    // Setup test directories with different features
    notaryDirectory = createMockDirectory('notaryfindernow', ['notary_search', 'mobile_notary_filter']);
    plumberDirectory = createMockDirectory('plumberfindernow', ['plumber_search']);
    lawyerDirectory = createMockDirectory('lawyerfindernow', ['lawyer_search']);
    emptyDirectory = createMockDirectory('emptydirectory', []);
  });

  describe('getSearchFormComponent', () => {
    it('returns the correct component for notary directory', () => {
      const component = getSearchFormComponent(notaryDirectory);
      // We're not testing the actual component, just that the correct one is selected
      expect(component).not.toBeUndefined();
    });

    it('returns undefined for a directory with no matching features', () => {
      const component = getSearchFormComponent(emptyDirectory);
      expect(component).toBeUndefined();
    });

    it('returns undefined for null directory data', () => {
      const component = getSearchFormComponent(null);
      expect(component).toBeUndefined();
    });

    it('returns undefined if features array is not defined', () => {
      const badDirectory = { ...notaryDirectory, features: undefined } as unknown as Directory;
      const component = getSearchFormComponent(badDirectory);
      expect(component).toBeUndefined();
    });

    it('properly handles multiple different directories', () => {
      // This test simulates having multiple directories with different features
      // It should select the appropriate component for each directory based on features
      
      // For notary directory, we expect a component
      const notaryComponent = getSearchFormComponent(notaryDirectory);
      expect(notaryComponent).not.toBeUndefined();
      
      // For plumber directory, we expect undefined (since we haven't registered that component yet)
      // In a real implementation, we would register plumber_search in the registry
      const plumberComponent = getSearchFormComponent(plumberDirectory);
      expect(plumberComponent).toBeUndefined();
      
      // For lawyer directory, we expect undefined (since we haven't registered that component yet)
      // In a real implementation, we would register lawyer_search in the registry
      const lawyerComponent = getSearchFormComponent(lawyerDirectory);
      expect(lawyerComponent).toBeUndefined();
    });
  });

  describe('getListWrapperComponent', () => {
    it('returns the correct component for notary directory', () => {
      const component = getListWrapperComponent(notaryDirectory);
      expect(component).not.toBeUndefined();
    });

    it('returns undefined for a directory with no matching features', () => {
      const component = getListWrapperComponent(emptyDirectory);
      expect(component).toBeUndefined();
    });

    it('returns undefined for null directory data', () => {
      const component = getListWrapperComponent(null);
      expect(component).toBeUndefined();
    });

    it('properly handles multiple different directories', () => {
      // This test simulates having multiple directories with different features
      
      // For notary directory, we expect a component
      const notaryComponent = getListWrapperComponent(notaryDirectory);
      expect(notaryComponent).not.toBeUndefined();
      
      // For other directories, we expect undefined until we register their components
      const plumberComponent = getListWrapperComponent(plumberDirectory);
      expect(plumberComponent).toBeUndefined();
      
      const lawyerComponent = getListWrapperComponent(lawyerDirectory);
      expect(lawyerComponent).toBeUndefined();
    });
  });

  // This test simulates adding a new directory with new features
  describe('Simulating adding a new directory', () => {
    it('demonstrates how to add support for a new directory', () => {
      // Step 1: Create a new directory with its features
      const healthInsuranceDirectory = createMockDirectory(
        'healthinsurancefindernow', 
        ['health_insurance_search']
      );
      
      // Step 2: Initially, there's no component for this feature
      const initialComponent = getSearchFormComponent(healthInsuranceDirectory);
      expect(initialComponent).toBeUndefined();
      
      // Step 3: In a real implementation, we would add the component to the registry:
      // searchFormRegistry['health_insurance_search'] = HealthInsuranceSearchForm;
      // listWrapperRegistry['health_insurance_search'] = HealthInsuranceList;
      
      // This test demonstrates that our architecture supports adding new directories
      // without requiring changes to existing code - just registry additions
    });
  });
});
