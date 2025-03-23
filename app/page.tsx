export default function HomePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Welcome to Now Directories Platform</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">About the Platform</h2>
        <p className="mb-4">
          Now Directories Platform is a comprehensive solution for managing and exploring 
          various directories of services and professionals.
        </p>
        <p>
          Our platform integrates with Supabase to provide real-time data access and management.
          Check out our <a href="/notaries" className="text-blue-600 hover:underline">Notaries Directory</a> to 
          see it in action.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3">Features</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Real-time data with Supabase integration</li>
            <li>Responsive, mobile-friendly design</li>
            <li>Advanced search and filtering</li>
            <li>User-friendly interface</li>
          </ul>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3">Get Started</h2>
          <p className="mb-4">
            Explore our directories to find the services you need:
          </p>
          <div className="space-y-2">
            <a 
              href="/notaries" 
              className="block bg-blue-600 text-white text-center py-2 px-4 rounded hover:bg-blue-700 transition"
            >
              Browse Notaries
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
