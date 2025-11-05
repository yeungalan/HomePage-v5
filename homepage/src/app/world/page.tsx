import dynamic from 'next/dynamic';

const WorldMap = dynamic(() => import('@/components/World'), {
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