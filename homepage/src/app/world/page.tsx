import { fetchWorldData } from '@/lib/worldData';
import WorldClient from '@/components/WorldClient';

// Disable static generation for this page to enable SSR
export const dynamic = 'force-dynamic';

export default async function Page() {
  // Fetch data on the server
  const { airports, routes, trainPaths } = await fetchWorldData();

  return (
    <div className="min-w-screen bg-green">
      <WorldClient
        airports={airports}
        routes={routes}
        trainPaths={trainPaths}
      />
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