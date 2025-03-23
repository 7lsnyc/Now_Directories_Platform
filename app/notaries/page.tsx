import NotaryList from '../../components/NotaryList';

export default function NotariesPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Notary Directory</h1>
      <NotaryList />
    </div>
  );
}
