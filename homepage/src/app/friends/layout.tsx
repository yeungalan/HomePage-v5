import type { Metadata } from 'next'
import type { PropsWithChildren } from 'react'

import { NormalContainer } from '@/components/NormalContainer'

export const metadata: Metadata = {
  title: 'Friends',
}

export default async function (props: PropsWithChildren) {
  return <NormalContainer>{props.children}</NormalContainer>
}