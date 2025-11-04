import { TwoColumnLayout } from '@/components/layouts/TwoColumnLayout';
import { ActivityPostList } from '@/components/ActivityPostList';
import Timeline from '@/components/Timeline';
import { ParticlesBackground } from '@/components/ParticlesBackground';

export const ActivitySection: React.FC = () => {
  return (
    <div className="mt-24 px-4 sm:px-6 lg:px-0">
      <ParticlesBackground />
      <TwoColumnLayout
        // Override only this section to force top alignment
        className="lg:items-start"
        leftContainerClassName="[&>div]:w-full"
        rightContainerClassName="block lg:flex [&>div]:w-full pr-4"
      >
        <ActivityPostList />
        <Timeline />
      </TwoColumnLayout>
    </div>
  );
};
