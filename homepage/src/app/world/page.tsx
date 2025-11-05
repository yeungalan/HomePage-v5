import dynamicImport from 'next/dynamic';

// Disable static generation for this page to enable SSR
export const dynamic = 'force-dynamic';

const WorldMap = dynamicImport(() => import('@/components/World'), {
  loading: () => <div>Loading map...</div> // Optional loading component
});

export default function Page() {
  return (
    <div className="min-w-screen bg-green">
      <WorldMap/>
    </div>
  )
}



/*
export default function Page() {
  return (
    <div className="min-w-screen bg-black">
      <WorldMap/>
    </div>
  )
}
  */