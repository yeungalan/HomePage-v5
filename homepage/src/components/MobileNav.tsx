"use client";
import { useState } from "react";
import { AnimatePresence, motion, useDragControls, PanInfo } from "motion/react";
import * as Dialog from "@radix-ui/react-dialog";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsxm } from "@/lib/helper";
import { type MenuItem } from "@/data/navigation";
import { Z_INDEX } from "@/constants/spacing";

interface MobileNavProps {
  menuConfig: MenuItem[];
  forceDarkMode?: boolean;
}

// Animation and gesture constants
const ANIMATION_CONFIG = {
  EXIT_ANIMATION_DELAY: 250, // milliseconds
  DRAG_CLOSE_THRESHOLD: 150, // pixels
  VELOCITY_CLOSE_THRESHOLD: 500, // pixels per second
} as const;

export function MobileNav({ menuConfig, forceDarkMode = false }: MobileNavProps) {
  const [, setIsOpen] = useState(false); // controls portal mount
  const [internalOpen, setInternalOpen] = useState(false); // controls animation
  const [, setDragY] = useState(0);
  const dragControls = useDragControls();
  const pathname = usePathname();

  // Open menu
  const openMenu = (): void => {
    setIsOpen(true);
    setInternalOpen(true);
  };

  // Close menu with animation
  const closeMenu = (): void => {
    setInternalOpen(false);
    setTimeout(() => setIsOpen(false), ANIMATION_CONFIG.EXIT_ANIMATION_DELAY);
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo): void => {
    if (
      info.offset.y > ANIMATION_CONFIG.DRAG_CLOSE_THRESHOLD ||
      info.velocity.y > ANIMATION_CONFIG.VELOCITY_CLOSE_THRESHOLD
    ) {
      closeMenu();
    }
    setDragY(0);
  };

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo): void => {
    // Only allow positive drag values (downward)
    if (info.offset.y > 0) {
      setDragY(info.offset.y);
    }
  };

  // Removed debug console.log

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={openMenu}
        className={clsxm(
          "flex items-center justify-center w-10 h-10 rounded-full transition-colors",
          forceDarkMode
            ? "text-gray-300 hover:bg-white/10"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        )}
        aria-label="Open navigation menu"
      >
        <Icon icon="mingcute:menu-line" className="text-2xl" />
      </button>

      <Dialog.Root open={true} onOpenChange={() => {}}>
        <Dialog.Portal>
          <AnimatePresence>
            {internalOpen && (
              <>
                {/* Overlay */}
                <Dialog.Overlay asChild>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                    style={{ zIndex: Z_INDEX.MOBILE_NAV }}
                    onClick={closeMenu} // overlay triggers slide-down
                  />
                </Dialog.Overlay>

                {/* Menu Content */}
                <Dialog.Content asChild>
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{
                      type: "spring",
                      damping: 30,
                      stiffness: 400,
                      mass: 0.8,
                    }}
                    drag="y"
                    dragControls={dragControls}
                    dragConstraints={{ top: 0, bottom: 0 }}
                    dragElastic={{ top: 0, bottom: 0.7 }}
                    dragMomentum
                    onDrag={handleDrag}
                    onDragEnd={handleDragEnd}
                    className={clsxm(
                      "fixed left-0 right-0 rounded-t-2xl shadow-2xl flex flex-col",
                      forceDarkMode ? "bg-[#1d1d1f]" : "bg-white dark:bg-zinc-900"
                    )}
                    style={{
                      touchAction: "none",
                      bottom: 0,
                      maxHeight: "85vh",
                      zIndex: Z_INDEX.TOOLTIP,
                    }}
                  >
                    {/* Drag Handle */}
                    <div
                      className={clsxm(
                        "w-full py-3 cursor-grab active:cursor-grabbing",
                        "flex justify-center rounded-t-2xl",
                        "transition-colors duration-200",
                        "hover:bg-gray-100 dark:hover:bg-zinc-700/50",
                        forceDarkMode
                          ? "bg-zinc-800/30"
                          : "bg-gray-50 dark:bg-zinc-800/30"
                      )}
                      onPointerDown={(e) => dragControls.start(e)}
                    >
                      <motion.div
                        className={clsxm(
                          "w-10 h-1 rounded-full",
                          forceDarkMode ? "bg-zinc-600" : "bg-gray-300 dark:bg-zinc-600"
                        )}
                        whileHover={{ scaleX: 1.2 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      />
                    </div>

                    {/* Menu Items */}
                    <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2">
                      {menuConfig.map((section, idx) => {
                        const subItemActive = section.subMenu?.find(
                          (item) =>
                            item.path === pathname || pathname.slice(1) === item.path
                        );

                        const isActive =
                          pathname === section.path ||
                          (pathname.startsWith(`${section.path}/`) &&
                            !section.exclude?.includes(pathname)) ||
                          !!subItemActive;

                        return (
                          <div key={section.path}>
                            <Link
                              href={section.path === "#" ? "#" : section.path}
                              onClick={(e) => {
                                if (section.path === "#") e.preventDefault();
                                else closeMenu();
                              }}
                              className={clsxm(
                                "flex items-center gap-2.5 w-full py-2.5 px-1 -mx-1 rounded-lg",
                                "transition-all duration-200",
                                "hover:bg-gray-100 dark:hover:bg-zinc-800",
                                "active:scale-[0.98]",
                                forceDarkMode
                                  ? isActive
                                    ? "text-white"
                                    : "text-gray-300"
                                  : isActive
                                  ? "text-blue-400 dark:text-gray-200"
                                  : "text-gray-700 dark:text-gray-300"
                              )}
                            >
                              <Icon
                                icon={subItemActive?.icon ?? section.icon}
                                className="text-[18px] flex-shrink-0 ml-1"
                              />
                              <span className="text-[15px] font-normal">
                                {subItemActive?.title ?? section.title}
                              </span>
                            </Link>

                            {section.subMenu && section.subMenu.length > 0 && (
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 ml-7 mb-1">
                                {section.subMenu.map((item) => {
                                  const isSubItemActive =
                                    pathname === item.path || pathname.slice(1) === item.path;
                                  return (
                                    <Link
                                      key={item.path}
                                      href={item.path}
                                      onClick={closeMenu}
                                      className={clsxm(
                                        "py-2 px-2 text-[14px] rounded-md",
                                        "transition-all duration-200",
                                        "active:scale-[0.97]",
                                        forceDarkMode
                                          ? isSubItemActive
                                            ? "text-white bg-blue-500/20 font-medium shadow-sm"
                                            : "text-gray-400 hover:text-gray-200 hover:bg-white/10 hover:shadow-sm"
                                          : isSubItemActive
                                          ? "text-gray-900 dark:text-white bg-blue-500/10 font-medium shadow-sm"
                                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-sm"
                                      )}
                                      target={item.path.startsWith("http") ? "_blank" : undefined}
                                      rel={item.path.startsWith("http") ? "noopener noreferrer" : undefined}
                                    >
                                      {item.title}
                                    </Link>
                                  );
                                })}
                              </div>
                            )}

                            {idx < menuConfig.length - 1 && (
                              <div
                                className={clsxm(
                                  "my-3 border-b",
                                  forceDarkMode
                                    ? "border-zinc-700/50"
                                    : "border-gray-200/60 dark:border-zinc-700/50"
                                )}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                </Dialog.Content>
              </>
            )}
          </AnimatePresence>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}