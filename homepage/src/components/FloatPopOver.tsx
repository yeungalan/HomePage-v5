import { clsxm } from '@/lib/helper';
import { useFloating, autoUpdate, flip, offset, shift  } from '@floating-ui/react-dom';
import { AnimatePresence, motion } from 'motion/react';
import React from 'react';
import { createPortal } from 'react-dom';


const { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext, createElement } = React;

        // Copy the FloatPopover component code here
        // Simple mobile detection hook (replaces useIsMobile)
        const useIsMobile = () => {
          const [isMobile, setIsMobile] = useState(false)
          
          useEffect(() => {
            const checkMobile = () => {
              setIsMobile(window.innerWidth < 1024) // lg breakpoint
            }
            
            checkMobile()
            window.addEventListener('resize', checkMobile)
            return () => window.removeEventListener('resize', checkMobile)
          }, [])
          
          return isMobile
        }

        // Simple client-side check
        const useIsClient = () => {
          const [isClient, setIsClient] = useState(false)
          useEffect(() => {
            setIsClient(true)
          }, [])
          return isClient
        }

        // Extracted spring preset
        const microReboundPreset = {
          type: 'spring',
          stiffness: 300,
          damping: 20,
        }

        // Extracted click away hook
        const useClickAway = (ref, onClickAway, events = ['mousedown', 'touchstart']) => {
          const savedCallback = useRef(onClickAway)
          useEffect(() => {
            savedCallback.current = onClickAway
          }, [onClickAway])
          
          useEffect(() => {
            const handler = (event) => {
              const { current: el } = ref
              el &&
                !el.contains(event.target) &&
                savedCallback.current(event)
            }
            for (const eventName of events) {
              document.addEventListener(eventName, handler)
            }
            return () => {
              for (const eventName of events) {
                document.removeEventListener(eventName, handler)
              }
            }
          }, [events, ref])
        }

        // Extracted event callback hook
        const useEventCallback = (fn) => {
          const ref = useRef(fn)
          useEffect(() => {
            ref.current = fn
          }, [fn])

          return useCallback((...args) => ref.current(...args), [])
        }

        // Simple portal component (replaces RootPortal)
        const RootPortal = (props) => {
          const isClient = useIsClient()
          if (!isClient) {
            return null
          }
          return createPortal(props.children, props.to || document.body)
        }

        // Simple sheet component for mobile (replaces PresentSheet)
        const PresentSheet = ({ content, children }) => {
          const [open, setOpen] = useState(false)
          
          return (
            <>
              <div onClick={() => setOpen(true)}>
                {children}
              </div>
              {open && (
                <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(false)}>
                  <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-lg p-4 max-h-[80vh] overflow-auto">
                    {content}
                  </div>
                </div>
              )}
            </>
          )
        }

        const PopoverActionContext = createContext(null)

        const usePopoverAction = () => useContext(PopoverActionContext)

        // Main FloatPopover component
        export const FloatPopover = (props) => {
          const isMobile = useIsMobile()
          if (isMobile && props.mobileAsSheet) {
            const { triggerElement, TriggerComponent, triggerComponentProps } = props

            const Child = triggerElement
              ? triggerElement
              : TriggerComponent
                ? createElement(TriggerComponent, triggerComponentProps)
                : null

            return (
              <PresentSheet content={props.children} {...props.sheet}>
                {Child}
              </PresentSheet>
            )
          }
          return <RealFloatPopover {...props} />
        }

        const RealFloatPopover = (props) => {
          const {
            headless = false,
            wrapperClassName: wrapperClassNames,
            TriggerComponent,
            triggerElement,
            trigger = 'hover',
            padding,
            offset: offsetValue,
            popoverWrapperClassNames,
            popoverClassNames,
            debug,
            animate = true,
            as: As = 'div',
            type = 'popover',
            triggerComponentProps,
            isDisabled,
            onOpen,
            onClose,
            to,
            asChild,
            ...floatingProps
          } = props

          const [open, setOpen] = useState(false)
          const { x, y, refs, strategy, isPositioned, elements, update } = useFloating({
            middleware: floatingProps.middleware ?? [
              flip({ padding: padding ?? 20 }),
              offset(offsetValue ?? 10),
              shift(),
            ],

            strategy: floatingProps.strategy,
            placement: floatingProps.placement ?? 'bottom-start',
            whileElementsMounted: floatingProps.whileElementsMounted,
          })

          useEffect(() => {
            if (open && elements.reference && elements.floating) {
              const cleanup = autoUpdate(elements.reference, elements.floating, update)
              return cleanup
            }
          }, [open, elements, update])

          const containerRef = useRef(null)

          useClickAway(containerRef, () => {
            if (trigger == 'click' || trigger == 'both') {
              doPopoverDisappear()
            }
          })

          const doPopoverDisappear = useCallback(() => {
            if (debug) {
              return
            }
            setOpen(false)
          }, [debug])

          const doPopoverShow = useEventCallback(() => {
            if (isDisabled) return
            setOpen(true)
          })

          const handleMouseOut = useCallback(() => {
            doPopoverDisappear()
          }, [doPopoverDisappear])

          const listener = useMemo(() => {
            const baseListener = {}
            switch (trigger) {
              case 'click': {
                return {
                  ...baseListener,
                  onClick: doPopoverShow,
                }
              }
              case 'hover': {
                return {
                  ...baseListener,
                  onMouseOver: doPopoverShow,
                  onMouseOut: doPopoverDisappear,
                }
              }
              case 'both': {
                return {
                  ...baseListener,
                  onClick: doPopoverShow,
                  onMouseOver: doPopoverShow,
                  onMouseOut: handleMouseOut,
                }
              }
            }
          }, [doPopoverDisappear, doPopoverShow, handleMouseOut, trigger])

          const Child = triggerElement ? (
            triggerElement
          ) : TriggerComponent ? (
            React.cloneElement(
              createElement(TriggerComponent, triggerComponentProps),
              {
                tabIndex: 0,
              },
            )
          ) : (
            <></>
          )
          
          const TriggerWrapper = asChild ? (
            React.cloneElement(
              typeof Child === 'string' ? React.createElement('span', {}, Child) : Child,
              {
                ...listener,
                ref: refs.setReference,
              },
            )
          ) : (
            React.createElement(As, {
              role: trigger === 'both' || trigger === 'click' ? 'button' : 'note',
              className: clsxm('inline-block', wrapperClassNames),
              ref: refs.setReference,
              ...listener
            }, Child)
          )

          useEffect(() => {
            if (refs.floating.current && open && type === 'popover') {
              refs.floating.current.focus()
            }
          }, [open])

          useEffect(() => {
            if (open) {
              onOpen?.()
            } else {
              onClose?.()
            }
          }, [open])
          
          const actionCtxValue = useMemo(() => {
            return { close: doPopoverDisappear }
          }, [doPopoverDisappear])

          if (!props.children) {
            return TriggerWrapper
          }

          return (
            <>
              {TriggerWrapper}

              <AnimatePresence>
                {open && (
                  <RootPortal to={to}>
                    <motion.div
                      className={clsxm(
                        'float-popover',
                        'relative z-[99]',
                        popoverWrapperClassNames,
                      )}
                      {...(trigger === 'hover' || trigger === 'both' ? listener : {})}
                      ref={containerRef}
                    >
                      <motion.div
                        tabIndex={-1}
                        role={type === 'tooltip' ? 'tooltip' : 'dialog'}
                        className={clsxm(
                          !headless && [
                            'rounded-xl border border-zinc-400/20 p-4 outline-none backdrop-blur-lg dark:border-zinc-500/30',
                            'bg-zinc-50/80 dark:bg-neutral-900/80',
                          ],

                          'relative z-[2]',

                          type === 'tooltip'
                            ? `max-w-[25rem] break-all rounded-xl px-4 py-2 shadow-out-sm`
                            : 'shadow-lg',
                          popoverClassNames,
                        )}
                        ref={refs.setFloating}
                        initial={{ y: '10px', opacity: 0 }}
                        animate={{ y: '0px', opacity: 1 }}
                        exit={{
                          y: '10px',
                          opacity: 0,
                          transition: { type: 'tween', duration: 0.2 },
                        }}
                        transition={microReboundPreset}
                        style={{
                          position: strategy,
                          top: y ?? '',
                          left: x ?? '',
                          visibility: isPositioned && x !== null ? 'visible' : 'hidden',
                        }}
                      >
                        <PopoverActionContext.Provider value={actionCtxValue}>
                          {props.children}
                        </PopoverActionContext.Provider>
                      </motion.div>
                    </motion.div>
                  </RootPortal>
                )}
              </AnimatePresence>
            </>
          )
        }