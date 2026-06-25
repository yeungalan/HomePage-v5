"use client"

import type { FC } from 'react';
import { useState } from 'react';
import { BottomToUpTransitionView } from "@/components/BottomToUpTransitionView";
import { motion } from 'motion/react'
import ThreeTierInfrastructure from "@/components/FlowGraph";
import type { Service } from "@/components/FlowGraph";
import { RealFooter } from "@/components/FooterLinks";
import { Icon } from '@iconify/react';
import { useTranslation } from "@/i18n";
import { INFRASTRUCTURE_CONFIG } from "@/data/infrastructure";
import { FLOWGRAPH_DEFAULTS } from "@/constants/colors";

const NodeDetailPanel: FC<{ node: Service }> = ({ node }) => (
  <motion.div
    className="mt-6 border border-gray-200 dark:border-neutral-800 rounded-xl shadow-sm bg-white dark:bg-neutral-900 p-6"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        {node.icon && (
          <div
            className="rounded-lg p-3 flex items-center justify-center"
            style={{ backgroundColor: node.iconBg ?? FLOWGRAPH_DEFAULTS.iconBg }}
          >
            <Icon icon={node.icon} width="32" height="32" style={{ color: node.iconColor ?? FLOWGRAPH_DEFAULTS.iconColor }} />
          </div>
        )}
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{node.serviceName}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{node.serviceId}</p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</h4>
        <p className="text-gray-600 dark:text-gray-400">{node.serviceDescription ?? 'No description available'}</p>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Details</h4>
        <div className="space-y-2">
          {node.tier && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-500">Tier:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{node.tier}</span>
            </div>
          )}
          {node.serviceType && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-500">Type:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{node.serviceType}</span>
            </div>
          )}
          {node.status && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-500">Status:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">{node.status}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  </motion.div>
)

const ArchitectureSection: FC = () => {
  const [selectedNode, setSelectedNode] = useState<Service | null>(null);

  return (
    <BottomToUpTransitionView duration={80}>
      <motion.div
        className="border border-gray-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-neutral-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <ThreeTierInfrastructure config={INFRASTRUCTURE_CONFIG} onNodeClick={(_, node) => setSelectedNode(node)} />
      </motion.div>
      {selectedNode && <NodeDetailPanel node={selectedNode} />}
    </BottomToUpTransitionView>
  )
}

export default function ArchPage() {
  const t = useTranslation();
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        <div className="pt-5">
          <main className="flex w-full flex-col">
            <div className="relative w-full overflow-hidden">
              <div className="w-full">
                <div className="mx-auto mt-14 max-w-3xl px-4 lg:mt-20 lg:px-0 2xl:max-w-4xl">
                  <header className="mb-10">
                    <h1 className="text-3xl font-bold mb-4 dark:text-white">{t('arch.title')}</h1>
                    <h3 className="text-xl text-gray-600 dark:text-gray-300">{t('arch.subtitle')}</h3>
                  </header>
                  <ArchitectureSection />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <RealFooter />
    </div>
  )
}
