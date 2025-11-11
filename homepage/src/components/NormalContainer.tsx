import { clsxm } from '@/lib/helper'

import { FunctionComponent, ReactNode } from 'react';

type Component<P = {}> = FunctionComponent<{
    className?: string;
} & {
    children?: ReactNode | undefined;
} & P>

export const NormalContainer: Component = (props) => {
  const { children, className } = props

  return (
    <div
      className={clsxm(
        'mx-auto max-w-3xl px-4 pt-[50px] sm:pt-[60px] lg:px-0 2xl:max-w-4xl',
        '[&_header]:mb-20',
        className,
      )}
    >
      {children}
    </div>
  )
}