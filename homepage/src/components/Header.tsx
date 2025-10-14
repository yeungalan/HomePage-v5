import { useState, useEffect, useCallback, useMemo, memo } from 'react';

// Types
interface MenuItem {
  title: string;
  path: string;
  type?: string;
  icon: string;
  subMenu?: SubMenuItem[];
  exclude?: string[];
}

interface SubMenuItem {
  path: string;
  title: string;
  icon?: string;
}

interface UserData {
  avatar: string;
  name: string;
  isOwner: boolean;
  isLoggedIn: boolean;
}

interface MetaData {
  title: string;
  description: string;
  slug: string;
  seoTitle: string;
}

// Mock data
const mockHeaderMenuConfig: MenuItem[] = [
  {
    title: '首页',
    path: '/',
    type: 'Home',
    icon: '🏠',
    subMenu: [
      { path: '/about', title: '关于' },
      { path: '/contact', title: '联系' }
    ],
  },
  {
    title: '文稿',
    path: '/posts',
    type: 'Post',
    subMenu: [
      { path: '/categories/tech', title: '技术' },
      { path: '/categories/life', title: '生活' }
    ],
    icon: '📝',
  },
  {
    title: '手记',
    type: 'Note',
    path: '/notes',
    icon: '✍️',
    exclude: ['/notes/topics'],
  },
  {
    title: '时光',
    icon: '⏰',
    path: '/timeline',
    subMenu: [
      { title: '手记', icon: '✍️', path: '/timeline?type=note' },
      { title: '文稿', icon: '📖', path: '/timeline?type=post' },
      { title: '回忆', icon: '💭', path: '/timeline?memory=1' },
      { title: '专栏', path: '/notes/topics', icon: '📚' },
    ],
  },
  {
    title: '友链',
    icon: '👥',
    path: '/friends',
  },
  {
    title: '更多',
    icon: '⚙️',
    path: '#',
    subMenu: [
      { title: '思考', icon: '💡', path: '/thinking' },
      { title: '项目', icon: '🧪', path: '/projects' },
      { title: '一言', path: '/says', icon: '💬' },
      { title: '跃迁', icon: '🌍', path: 'https://travel.moe/go.html' },
    ],
  },
];

const mockUserData: UserData = {
  avatar: 'https://avatars.githubusercontent.com/u/41265413?v=4',
  name: 'Innei',
  isOwner: false,
  isLoggedIn: false
};

const mockMetaData: MetaData = {
  title: 'Welcome to My Blog',
  description: 'A personal blog about technology and life',
  slug: 'home',
  seoTitle: "Innei's Blog"
};

// Utility function
const clsxm = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

// Custom hooks
const usePathname = () => {
  const [pathname, setPathname] = useState('/');
  
  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
    };
    
    window.addEventListener('popstate', handlePopState);
    setPathname(window.location.pathname);
    
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
  return pathname;
};

const useViewport = () => {
  const [viewport, setViewport] = useState({ lg: false, w: 0 });
  
  useEffect(() => {
    const updateViewport = () => {
      const w = window.innerWidth;
      setViewport({ lg: w >= 1024, w });
    };
    
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);
  
  return viewport;
};

// Components
const SiteOwnerAvatar = ({ className }: { className?: string }) => {
  const { avatar } = mockUserData;
  
  return (
    <div
      className={clsxm(
        'pointer-events-none relative z-[9] size-[40px] select-none',
        'overflow-hidden rounded-full',
        className,
      )}
    >
      <img
        src={avatar}
        alt="Site Owner Avatar"
        width={40}
        height={40}
        className="ring-2 ring-slate-200 dark:ring-neutral-800 w-full h-full object-cover"
      />
    </div>
  );
};

const Activity = () => {
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
      <span>Online</span>
    </div>
  );
};

const TapableLogo = () => {
  const handleClick = useCallback(() => {
    window.location.href = '/';
  }, []);

  return (
    <button 
      onClick={handleClick}
      className="focus:outline-none"
    >
      <SiteOwnerAvatar className="cursor-pointer" />
      <span className="sr-only">Owner Avatar</span>
    </button>
  );
};

const AnimatedLogo = () => {
  const { lg: isDesktop, w } = useViewport();

  if (isDesktop && w !== 0) {
    return (
      <div className="flex items-center gap-3">
        <TapableLogo />
        <Activity />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Activity />
      <TapableLogo />
    </div>
  );
};

const HeaderMeta = ({ show }: { show: boolean }) => {
  const { title, description, slug } = mockMetaData;

  if (!show) return null;

  return (
    <div
      className={clsxm(
        'absolute inset-0 flex min-w-0 items-center justify-between gap-3 px-0 lg:px-16',
        'transition-opacity duration-300',
        show ? 'opacity-100' : 'opacity-0'
      )}
    >
      <div className="flex min-w-0 shrink grow flex-col">
        <small className="min-w-0 truncate">
          <span className="text-gray-600/60 dark:text-gray-300/60">
            {description}
          </span>
        </small>
        <h2 className="min-w-0 truncate text-[1.2rem] font-medium leading-normal">
          {title}
        </h2>
      </div>

      <div className="hidden min-w-0 shrink-[5] flex-col text-right leading-5 lg:flex">
        <small className="min-w-0 truncate whitespace-pre text-gray-600/60 dark:text-gray-300/60">
          {slug}
        </small>
        <span className="font-medium text-gray-600 dark:text-gray-300">
          {mockMetaData.seoTitle}
        </span>
      </div>
    </div>
  );
};

const MenuPopover = ({ children, subMenu }: { children: React.ReactNode; subMenu?: SubMenuItem[] }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!subMenu || subMenu.length === 0) {
    return <>{children}</>;
  }

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {children}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-w-[200px] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {subMenu.map((item, index) => (
            <a
              key={index}
              href={item.path}
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              target={item.path.startsWith('http') ? '_blank' : undefined}
              rel={item.path.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.title}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

const HeaderMenuItem = memo(({ 
  section, 
  isActive, 
  subItemActive 
}: { 
  section: MenuItem; 
  isActive: boolean; 
  subItemActive?: SubMenuItem 
}) => {
  const href = section.path;

  return (
    <MenuPopover subMenu={section.subMenu}>
      <div>
        <a
          href={href}
          className={clsxm(
            'relative block whitespace-nowrap px-4 py-2 transition-colors',
            isActive ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300 hover:text-blue-500/80'
          )}
          target={href.startsWith('http') ? '_blank' : undefined}
          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
        >
          <span className="relative flex items-center gap-2">
            {isActive && (
              <span className="flex items-center">
                {subItemActive?.icon ?? section.icon}
              </span>
            )}
            <span>{subItemActive?.title ?? section.title}</span>
          </span>
          {isActive && (
            <span className="absolute inset-x-1 -bottom-px h-px bg-gradient-to-r from-blue-500/0 via-blue-500/70 to-blue-500/0" />
          )}
        </a>
      </div>
    </MenuPopover>
  );
});

const DesktopNav = ({ shouldHideNavBg }: { shouldHideNavBg: boolean }) => {
  const pathname = usePathname();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - bounds.left,
      y: e.clientY - bounds.top,
    });
  }, []);

  return (
    <nav
      onMouseMove={handleMouseMove}
      className={clsxm(
        'relative rounded-full transition-all duration-200',
        'bg-gradient-to-b from-zinc-50/70 to-white/90',
        'shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 backdrop-blur-md',
        'dark:from-zinc-900/70 dark:to-zinc-800/90 dark:ring-zinc-100/10',
        'group pointer-events-auto',
        shouldHideNavBg && '!bg-none !shadow-none !ring-transparent',
      )}
    >
      <div
        className="spotlight pointer-events-none absolute -inset-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(200px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.12) 0%, transparent 65%)`,
        }}
      />
      <div className="flex px-4 font-medium text-zinc-800 dark:text-zinc-200">
        {mockHeaderMenuConfig.map((section) => {
          const subItemActive = section.subMenu?.find(item => 
            item.path === pathname || pathname.slice(1) === item.path
          );

          const isActive = pathname === section.path ||
            (pathname.startsWith(`${section.path}/`) &&
            !section.exclude?.includes(pathname)) ||
            !!subItemActive;

          return (
            <HeaderMenuItem
              section={section}
              key={section.path}
              subItemActive={subItemActive}
              isActive={isActive}
            />
          );
        })}
      </div>
    </nav>
  );
};

const HeaderDrawerButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle menu"
    >
      <div className="flex flex-col space-y-1">
        <span className={clsxm(
          'block w-4 h-0.5 bg-gray-600 dark:bg-gray-300 transition-transform',
          isOpen && 'rotate-45 translate-y-1.5'
        )} />
        <span className={clsxm(
          'block w-4 h-0.5 bg-gray-600 dark:bg-gray-300 transition-opacity',
          isOpen && 'opacity-0'
        )} />
        <span className={clsxm(
          'block w-4 h-0.5 bg-gray-600 dark:bg-gray-300 transition-transform',
          isOpen && '-rotate-45 -translate-y-1.5'
        )} />
      </div>
    </button>
  );
};

const UserAuth = () => {
  const { isOwner, avatar } = mockUserData;

  if (isOwner) {
    return (
      <div className="pointer-events-auto relative flex items-center justify-center">
        <img
          className="rounded-full w-9 h-9 ring-2 ring-gray-200 dark:ring-gray-700"
          src={avatar}
          alt="site owner"
        />
      </div>
    );
  }

  return (
    <button
      className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 transition-colors"
      aria-label="User Login"
    >
      <span className="text-lg">👤</span>
    </button>
  );
};

// Main Header Component
export default function Header() {
  const [hasShadow, setHasShadow] = useState(false);
  const [showMeta, setShowMeta] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const { lg: isDesktop } = useViewport();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setHasShadow(scrollY > 10);
      setShowMeta(scrollY > 100);
      setOpacity(Math.max(0, 1 - scrollY / 200));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const shouldHideNavBg = !showMeta && opacity === 0;

  return (
    <header className={clsxm(
      'fixed top-0 left-0 right-0 z-50 h-16 transition-shadow duration-200',
      hasShadow && 'shadow-sm'
    )}>
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50" />
      
      <div className={clsxm(
        'relative mx-auto grid h-full min-h-0 max-w-7xl grid-cols-[4.5rem_auto_4.5rem] lg:px-8',
      )}>
        <div className="flex items-center justify-start lg:justify-center">
          <HeaderDrawerButton />
        </div>

        <div className="flex items-center justify-center lg:justify-start">
          <AnimatedLogo />
          {!isDesktop && <HeaderMeta show={showMeta} />}
        </div>

        <div className="flex items-center justify-center relative">
          <div
            className="duration-100 transition-opacity"
            style={{
              opacity: showMeta ? opacity : 1,
              visibility: opacity === 0 && showMeta ? 'hidden' : 'visible',
            }}
          >
            <DesktopNav shouldHideNavBg={shouldHideNavBg} />
          </div>
          {isDesktop && <HeaderMeta show={showMeta} />}
        </div>

        <div className="flex items-center justify-end">
          <UserAuth />
        </div>
      </div>
    </header>
  );
}