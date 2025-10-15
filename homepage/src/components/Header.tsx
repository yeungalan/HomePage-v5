"use client";
import { useState, useEffect, useCallback, memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Types
interface MenuItem {
  title: string;
  path: string;
  icon: string;
  subMenu?: SubMenuItem[];
  exclude?: string[];
}

interface SubMenuItem {
  path: string;
  title: string;
  icon?: string;
}

interface HeaderProps {
  forceDarkMode?: boolean;
}

// Mock data
const mockHeaderMenuConfig: MenuItem[] = [
  {
    title: '首页',
    path: '/home/',
    icon: '🏠',
    subMenu: [
      { path: '/header', title: '关于' },
      { path: '/contact', title: '联系' }
    ],
  },
  {
    title: '文稿',
    path: '/testComponent/world',
    subMenu: [
      { path: '/categories/tech', title: '技术' },
      { path: '/categories/life', title: '生活' }
    ],
    icon: '📝',
  },
  {
    title: '手记',
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

// Utility function
const clsxm = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

// Animation variants
const popoverVariants = {
  initial: { 
    opacity: 0, 
    y: -10,
    scale: 0.95
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30,
      mass: 0.8
    }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    scale: 0.95,
    transition: { 
      type: 'tween', 
      duration: 0.15 
    }
  }
};

const itemVariants = {
  initial: { opacity: 0, x: -10 },
  animate: (index: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: index * 0.05,
      type: 'spring',
      stiffness: 400,
      damping: 25
    }
  })
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

// Components
const MenuPopover = ({ 
  children, 
  subMenu, 
  forceDarkMode 
}: { 
  children: React.ReactNode; 
  subMenu?: SubMenuItem[];
  forceDarkMode?: boolean;
}) => {
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
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={popoverVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={clsxm(
              'absolute top-full left-0 mt-2 py-2 min-w-[200px] z-[99]',
              'rounded-xl backdrop-blur-md',
              'border shadow-lg focus-visible:ring-0 outline-none',
              forceDarkMode
                ? 'bg-[#1d1d1f]/90 border-zinc-100/10 shadow-zinc-950/50'
                : 'bg-white/80 dark:bg-neutral-900/80 border-zinc-900/5 shadow-zinc-800/5 dark:border-zinc-100/10'
            )}
          >
            {subMenu.map((item, index) => (
              <motion.a
                key={index}
                custom={index}
                variants={itemVariants}
                initial="initial"
                animate="animate"
                href={item.path}
                className={clsxm(
                  'flex items-center px-4 py-3 text-sm',
                  'transition-colors duration-200 relative',
                  forceDarkMode
                    ? 'text-gray-300 hover:bg-blue-500/10 hover:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-blue-500/5 hover:text-blue-500'
                )}
                target={item.path.startsWith('http') ? '_blank' : undefined}
                rel={item.path.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                <span>{item.title}</span>
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const HeaderMenuItem = memo(({ 
  section, 
  isActive, 
  subItemActive,
  forceDarkMode
}: { 
  section: MenuItem; 
  isActive: boolean; 
  subItemActive?: SubMenuItem;
  forceDarkMode?: boolean;
}) => {
  const href = section.path;

  return (
    <MenuPopover subMenu={section.subMenu} forceDarkMode={forceDarkMode}>
      <div>
        <a
          href={href}
          className={clsxm(
            'relative block whitespace-nowrap px-4 py-2 transition-colors duration-200',
            forceDarkMode
              ? isActive ? 'text-blue-400' : 'text-gray-300 hover:text-blue-400/80'
              : isActive ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300 hover:text-blue-500/80'
          )}
          target={href.startsWith('http') ? '_blank' : undefined}
          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
        >
          <span className="relative flex items-center gap-2">
            {isActive && (
              <motion.span 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                className="flex items-center"
              >
                {subItemActive?.icon ?? section.icon}
              </motion.span>
            )}
            <span>{subItemActive?.title ?? section.title}</span>
          </span>
          {isActive && (
            <motion.span 
              layoutId="activeIndicator"
              className={clsxm(
                'absolute inset-x-1 -bottom-px h-px',
                forceDarkMode
                  ? 'bg-gradient-to-r from-blue-400/0 via-blue-400/70 to-blue-400/0'
                  : 'bg-gradient-to-r from-blue-500/0 via-blue-500/70 to-blue-500/0'
              )}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </a>
      </div>
    </MenuPopover>
  );
});

const DesktopNav = ({ 
  hasShadow, 
  forceDarkMode 
}: { 
  hasShadow: boolean;
  forceDarkMode?: boolean;
}) => {
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
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onMouseMove={handleMouseMove}
      className={clsxm(
        'relative rounded-full transition-all duration-200',
        'backdrop-blur-md group pointer-events-auto',
        forceDarkMode
          ? 'bg-[#1d1d1f]/90'
          : 'bg-gradient-to-b from-zinc-50/70 to-white/90 dark:from-zinc-900/70 dark:to-zinc-800/90',
        hasShadow ? '' : 'ring-1 shadow-lg',
        forceDarkMode
          ? 'ring-zinc-100/10 shadow-zinc-950/50'
          : 'ring-zinc-900/5 dark:ring-zinc-100/10 shadow-zinc-800/5'
      )}
    >
      <motion.div
        className="spotlight pointer-events-none absolute -inset-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(200px circle at ${mousePos.x}px ${mousePos.y}px, ${
            forceDarkMode 
              ? 'rgba(59, 130, 246, 0.15)' 
              : 'rgba(59, 130, 246, 0.12)'
          } 0%, transparent 65%)`,
        }}
      />
      <div className={clsxm(
        'flex px-4 font-medium',
        forceDarkMode
          ? 'text-zinc-200'
          : 'text-zinc-800 dark:text-zinc-200'
      )}>
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
              forceDarkMode={forceDarkMode}
            />
          );
        })}
      </div>
    </motion.nav>
  );
};

// Main Header Component
export default function Header({ forceDarkMode = false }: HeaderProps) {
  const [hasShadow, setHasShadow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setHasShadow(scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={clsxm(
      'fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-200',
      'backdrop-blur-md',
      forceDarkMode
        ? 'bg-[#1d1d1f]/60'
        : 'bg-white/60 dark:bg-zinc-900/60',
      hasShadow && 'shadow-sm border-b',
      forceDarkMode
        ? 'border-zinc-100/10'
        : 'border-zinc-900/5 dark:border-zinc-100/10'
    )}>      
      <div className="relative mx-auto flex items-center justify-center h-full max-w-7xl px-8">
        <DesktopNav hasShadow={hasShadow} forceDarkMode={forceDarkMode} />
      </div>
    </header>
  );
}