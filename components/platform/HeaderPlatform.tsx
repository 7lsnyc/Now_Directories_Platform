/**
 * Platform header component for Now Directories
 * Contains the brand logo/name and navigation
 */
export default function HeaderPlatform() {
  return (
    <header className="px-4 sm:px-6 py-4 border-b border-gray-700">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="font-bold text-lg sm:text-xl">Now Directories</h1>
        <nav className="hidden md:block">
          {/* Future nav links can go here */}
        </nav>
      </div>
    </header>
  );
}
