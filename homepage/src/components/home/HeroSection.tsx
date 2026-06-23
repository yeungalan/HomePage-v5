'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import clsx from 'clsx';
import { TwoColumnLayout } from '@/components/layouts/TwoColumnLayout';
import { BottomToUpTransitionView } from '@/components/BottomToUpTransitionView';
import GiantGreetText, { GiantGreetTextTemplate } from '@/components/greet-text/GreetText';
import { isSupportIcon, SocialIcon } from '@/components/SocialIcon';
import { softBouncePreset } from '@/constants/spring';
import { clsxm } from '@/lib/helper';
import { useTranslation } from '@/i18n';
import { QUOTES, getDifferentQuoteIndex, getRandomQuoteIndex } from '@/data/quotes';
import { getSocialLinksArray } from '@/data/social';
import { ANIMATION_DELAYS, ANIMATION_DURATIONS, calculateStaggerDelay } from '@/constants/timing';

export const HeroSection: React.FC = () => {
  const t = useTranslation();
  const titleAnimateD =
    GiantGreetTextTemplate.reduce((acc, cur) => {
      return acc + (cur.text?.length || 0);
    }, 0) * 50;

  const [quoteIndex, setQuoteIndex] = useState(getRandomQuoteIndex());
  const [hasChanged, setHasChanged] = useState(false);

  const handleRefreshQuote = () => {
    setHasChanged(true);
    setQuoteIndex((prev) => getDifferentQuoteIndex(prev));
  };

  return (
    <div className="mt-20 min-w-0 max-w-screen overflow-hidden lg:mt-[-4.5rem] lg:h-dvh lg:min-h-[800px]">
      <TwoColumnLayout leftContainerClassName="pr-4 pl-4 mt-[120px] lg:mt-0 lg:h-[15rem] lg:h-1/2">
        <>
          <GiantGreetText />

          <ul className="center mx-[60px] mt-8 flex flex-wrap gap-6 lg:mx-auto lg:mt-28 lg:justify-start lg:gap-4">
            {getSocialLinksArray().map(([type, id], index) => {
              if (!isSupportIcon(type)) return null;
              return (
                <BottomToUpTransitionView
                  key={type}
                  delay={
                    calculateStaggerDelay(index, ANIMATION_DELAYS.STAGGER_MS) +
                    titleAnimateD +
                    ANIMATION_DELAYS.TITLE_OFFSET
                  }
                  className="inline-block"
                  as="li"
                >
                  <SocialIcon id={id} type={type} />
                </BottomToUpTransitionView>
              );
            })}
          </ul>
        </>

        <div className={clsx('lg:size-[300px]', 'size-[200px]', 'mt-24 lg:mt-0')}>
          <Image
            height={300}
            width={300}
            src={'/assets/images/profilePic.png'}
            alt="Site Owner Avatar"
            className={clsxm(
              'aspect-square rounded-full border border-slate-200 dark:border-neutral-800',
              'w-full',
            )}
          />
        </div>

        <motion.div
          initial={{ opacity: 0.0001, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={softBouncePreset}
          className={clsx(
            'center inset-x-0 bottom-0 mt-12 flex flex-col lg:absolute lg:mt-0',
            'center text-neutral-800/80 dark:text-neutral-200/80',
          )}
        >
          <div className="px-4 sm:px-0">
            <div className="flex items-center gap-3">
              <motion.small
                key={quoteIndex}
                initial={
                  hasChanged
                    ? { opacity: 0, scaleY: 0, scaleX: 1.2 }
                    : { opacity: 1, scaleY: 1, scaleX: 1 }
                }
                animate={{ opacity: 1, scaleY: 1, scaleX: 1 }}
                transition={{
                  duration: hasChanged ? ANIMATION_DURATIONS.STANDARD : 0,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
                className="text-center origin-center"
              >
                {QUOTES[quoteIndex]}
              </motion.small>
              <button
                onClick={handleRefreshQuote}
                className="shrink-0 rounded-full p-1.5 transition-colors hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50"
                aria-label={t('hero.changeSentence')}
              >
                <Icon icon="mingcute:refresh-1-line" className="text-xs" />
              </button>
            </div>
          </div>
          <span className="mt-8 animate-bounce">
            <Icon icon="mingcute:right-line" className="rotate-90 text-2xl" />
          </span>
        </motion.div>
      </TwoColumnLayout>
    </div>
  );
};
