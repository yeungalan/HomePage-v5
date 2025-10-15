import { microReboundPreset } from "@/constants/spring"
import { m, motion } from "motion/react"
import { createElement } from "react"
import { IcTwotoneSignpost, FaSolidFeatherAlt, FaSolidHistory, FaSolidUserFriends, MdiLightbulbOn20, MdiFlask, FaSolidComments, RMixPlanet } from "./icons/menu-collection"
import { StyledButton } from "./StyledButton"
import { NumberSmoothTransition } from "./NumberSmoothTransition"

const windsock = [
  {
    title: '文稿',
    path: '/posts',
    type: 'Post',
    subMenu: [],
    icon: IcTwotoneSignpost,
  },
  {
    title: '手记',
    type: 'Note',
    path: '/notes',
    icon: FaSolidFeatherAlt,
  },
  {
    title: '度过的时光呀',
    icon: FaSolidHistory,
    path: '/timeline',
  },
  {
    title: '朋友们',
    icon: FaSolidUserFriends,
    path: '/friends',
  },
  {
    title: '写下一点思考',
    icon: MdiLightbulbOn20,
    path: '/thinking',
  },
  {
    title: '看看我做些啥',
    icon: MdiFlask,
    path: '/projects',
  },
  {
    title: '记录下一言',
    path: '/says',
    icon: FaSolidComments,
  },
  {
    title: '跃迁',
    icon: RMixPlanet,
    path: 'https://travel.moe/go.html',
  },
]

export const Footer = () => {
  return (
    <>
      <div className="center mt-10 mb-20 flex flex-col">
        <div className="my-5 text-2xl font-medium">Quick links</div>
        <div className="mb-24 opacity-90">Want to go somewhere else?</div>
        <ul className="flex flex-col flex-wrap gap-2 gap-y-8 opacity-80 lg:flex-row">
          {windsock.map((item, index) => {
            return (
              <motion.li
                initial={{ opacity: 0.0001, y: 10 }}
                viewport={{ once: true }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    stiffness: 641,
                    damping: 23,
                    mass: 3.9,
                    type: 'spring',
                    delay: index * 0.05,
                  },
                }}
                transition={{
                  delay: 0.001,
                }}
                whileHover={{
                  y: -10,
                  transition: {
                    ...microReboundPreset,
                    delay: 0.001,
                  },
                }}
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <a
                  href={item.path}
                  className="flex items-center gap-4 text-neutral-800 duration-200 hover:!text-[#33A6B8] dark:text-neutral-200"
                >
                  {createElement(item.icon, { className: 'w-6 h-6' })}
                  <span>{item.title}</span>
                </a>

                {index != windsock.length - 1 && (
                  <span className="mx-4 hidden select-none lg:inline"> · </span>
                )}
              </motion.li>
            )
          })}
        </ul>
      </div>
    </>
  )
}