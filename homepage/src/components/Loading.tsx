import { clsxm } from '@/lib/helper'
import { Icon } from '@iconify/react'
import threeDotsLoading from '@iconify/icons-eos-icons/three-dots-loading';
import * as React from 'react'


export type LoadingProps = {
  loadingText?: string
  useDefaultLoadingText?: boolean
}

type Component<P = {}> = React.FunctionComponent<{
    className?: string;
} & {
    children?: React.ReactNode | undefined;
} & P>


const defaultLoadingText = 'Loading...'
export const Loading: Component<LoadingProps> = ({
  loadingText,
  className,
  useDefaultLoadingText = false,
}) => {
  const nextLoadingText = useDefaultLoadingText
    ? defaultLoadingText
    : loadingText
  return (
    <div
      data-hide-print
      className={clsxm('my-20 flex flex-col center', className)}
    >
      <Icon icon={threeDotsLoading} className={"text-black dark:text-white text-8xl"} />
      {!!nextLoadingText && (
        <span className="mt-2 block text-black dark:text-white">{nextLoadingText}</span>
      )}
    </div>
  )
}

export const FullPageLoading = () => (
  <Loading useDefaultLoadingText className="h-[calc(100vh-6.5rem-10rem)]" />
)
