import NotaryList from '../../components/NotaryList';

export default function NotariesPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <section className="bg-theme-gradient text-white p-8 rounded-lg mb-10">
        <h1 className="text-3xl font-bold mb-4">Notary Directory</h1>
        <p className="text-lg">Find qualified notaries in your area</p>
      </section>
      
      <div className="bg-white shadow-lg rounded-lg p-6">
        <NotaryList />
      </div>
    </div>
  );
}
