/**
 * Collection of inspirational quotes displayed on the homepage
 */

export const QUOTES = [
  'No one can move on without losing something',
  'I think, therefore I am — René Descartes',
  'Practice is the sole criterion for testing truth — Deng Xiaoping',
  'Everything has two sides — Vladimir Ilyich Lenin',
  'Stay hungry, Stay foolish — Steve Jobs',
  'You know who walks with you when the road gets rough',
  'Til I reach the end, and then I will start again  — Zootopia',
  'In the infinite river of time, life is but a spark that vanishes in an instant',
  'The only impossible journey is the one you never begin — Tony Robbins',
  'Even the darkest night will end and the sun will rise — Les Misérables',
  'Only those who dare to fail greatly can ever achieve greatly — Robert F. Kennedy',
  'I am on my way to you, chasing after your name — Radwimps',
  'We are time fliers Scaling the walls of time, climber Tired of playing hide and seek with time and Always coming just short — Radwimps',
  'When you believe you can, the whole world conspires to help you — The Alchemist',
  'We shall never surrender — Winston Churchill',
  'I have nothing to offer but blood, toil, tears and sweat — Winston Churchill',
  'If what you have done yesterday still looks big to you, you haven\'t done much today — Mikhail Gorbachev',
  'Life is 10% what happens to you and 90% how you react to it — Charles R. Swindoll',
  'Be yourself; everyone else is already taken — Oscar Wilde',
  'The best time to plant a tree was 20 years ago. The second best time is now',
  'In the middle of difficulty lies opportunity — Albert Einstein',
  'The future belongs to those who believe in the beauty of their dreams — Eleanor Roosevelt',
  'Freedom has many difficulties and democracy is not perfect - John F. Kennedy',
] as const;

/**
 * Get a random quote from the collection
 */
export const getRandomQuote = (): string => {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
};

/**
 * Get a random quote index
 */
export const getRandomQuoteIndex = (): number => {
  return Math.floor(Math.random() * QUOTES.length);
};

/**
 * Get a different random quote index (ensures it's not the same as the previous)
 */
export const getDifferentQuoteIndex = (currentIndex: number): number => {
  if (QUOTES.length <= 1) return currentIndex;

  let newIndex: number;
  do {
    newIndex = Math.floor(Math.random() * QUOTES.length);
  } while (newIndex === currentIndex);

  return newIndex;
};
