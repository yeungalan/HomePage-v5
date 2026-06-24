export interface LinkEntry {
  id: string;
  name: string;
  url: string;
  avatar: string;
  description: string;
}

export const FRIENDS_DATA: LinkEntry[] = [
  {
    id: '1',
    name: 'imuslab',
    url: 'https://imuslab.com',
    avatar: '/assets/images/imuslab.png',
    description: "Toby's Homebrew Tech Research",
  },
  {
    id: '2',
    name: 'Hyper space',
    url: 'https://photo.tupolev.xyz/',
    avatar: 'https://i.imgur.com/b2qK4Lx.jpeg',
    description: "HyperXraft's Photobook",
  },
];
