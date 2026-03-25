import { TwoColumnLayout } from '@/components/layouts/TwoColumnLayout';
import { ActivityPostList } from '@/components/ActivityPostList';
import Timeline from '@/components/Timeline';
import { ParticlesBackground } from '@/components/ParticlesBackground';

export const ActivitySection: React.FC = () => {
  return (
    <div className="mt-24 px-4 sm:px-6 lg:px-0">
      <ParticlesBackground />
      <TwoColumnLayout
        className="lg:items-start lg:justify-center"
        leftContainerClassName="[&>div]:w-full [&>div]:lg:max-w-xl lg:pl-4"
        rightContainerClassName="block lg:flex [&>div]:w-full [&>div]:lg:max-w-xl pr-4"
      >
        <ActivityPostList />
        <Timeline />
      </TwoColumnLayout>
    </div>
  );
};
