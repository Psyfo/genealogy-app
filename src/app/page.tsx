import GraphViewer from '@/components/GraphViewer';

export default function Home() {
  return (
    <main className='min-h-screen bg-slate-900 text-slate-100 p-6'>
      <h1 className='text-3xl font-bold mb-6'>Genealogy Visualizer</h1>
      <GraphViewer />
    </main>
  );
}
