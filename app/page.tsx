export default function HomePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <section className="bg-theme-gradient text-white p-8 rounded-lg mb-10">
        <h1 className="text-4xl font-bold mb-6">Welcome to Now Directories Platform</h1>
        <p className="text-lg mb-4">
          A comprehensive solution for managing and exploring various directories of services and professionals.
        </p>
      </section>
      
      <div className="bg-white shadow-lg rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">About the Platform</h2>
        <p className="mb-4 text-gray-700">
          Now Directories Platform is a comprehensive solution for managing and exploring 
          various directories of services and professionals.
        </p>
        <p className="text-gray-700">
          Our platform integrates with Supabase to provide real-time data access and management.
          Check out our <a href="/directory/notary" className="text-theme-primary hover:text-theme-secondary font-medium">Notary Directory</a> to 
          see it in action.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Features</h2>
          <ul className="list-disc pl-5 space-y-3 text-gray-700">
            <li>Real-time data with Supabase integration</li>
            <li>Responsive, mobile-friendly design</li>
            <li>Advanced search and filtering</li>
            <li>User-friendly interface</li>
          </ul>
        </div>
        
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Get Started</h2>
          <p className="mb-6 text-gray-700">
            Explore our directories to find the services you need:
          </p>
          <div className="space-y-3">
            <a 
              href="/directory/notary" 
              className="block bg-theme-primary text-white text-center py-3 px-6 rounded-md hover:bg-opacity-90 transition font-medium"
            >
              Browse Notary Directory
            </a>
            <a 
              href="/notaries" 
              className="block bg-theme-secondary text-white text-center py-3 px-6 rounded-md hover:bg-opacity-90 transition font-medium"
            >
              Browse Notaries
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
