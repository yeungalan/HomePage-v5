import { clsxm } from '@/lib/helper'

import { FunctionComponent, ReactNode } from 'react';

type Component<P = Record<string, never>> = FunctionComponent<{
    className?: string;
} & {
    children?: ReactNode | undefined;
} & P>

export const NormalContainer: Component = (props) => {
  const { children, className } = props

  return (
    <div
      className={clsxm(
        'mx-auto mt-14 max-w-3xl px-4 lg:mt-20 lg:px-0 2xl:max-w-4xl',
        '[&_header]:mb-20',
        className,
      )}
    >
      {children}
    </div>
  )
}