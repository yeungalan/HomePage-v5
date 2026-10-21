import { NextResponse } from 'next/server';
import { fetchOfficialStatuses } from '@/lib/official-status';

export const revalidate = 60;

export async function GET() {
  return NextResponse.json(await fetchOfficialStatuses());
}
