import NotaryListWrapper from '../../components/NotaryListWrapper';

/**
 * Notaries Directory Page
 * Shows a list of all available notaries with search and filtering options
 */
export default function NotariesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Available Notaries</h1>
      <NotaryListWrapper />
    </div>
  );
}
