"use client"

import { BottomToUpTransitionView } from "@/components/BottomToUpTransitionView";
import { motion } from 'motion/react'
import ThreeTierInfrastructure from "@/components/FlowGraph";
import { RealFooter } from "@/components/FooterLinks";

// Example 3: Custom tiers/layers definition
const infrastructureConfig = {
  tiers: ['Client Plane', 'Cloud Plane', 'Data Plane', 'Control Plane s01', 'Control Plane s02', 'Control Plane s03'],
  services: [
    // Client Layer
    {
      serviceId: "user",
      serviceName: "User",
      serviceDescription: "End User",
      tier: "Client Plane",
      icon: "mdi:account",
      iconBg: "#e0e7ff",
      iconColor: "#4f46e5",
      status: "unknown"
    },

    // Cloud Services Layer
    {
      serviceId: "cloudflare",
      serviceName: "CloudFlare",
      serviceDescription: "CDN/DNS",
      tier: "Cloud Plane",
      icon: "mdi:cloud-outline",
      iconBg: "#fff7ed",
      iconColor: "#f97316",
      status: "unknown"
    },
    {
      serviceId: "icloud",
      serviceName: "iCloud",
      serviceDescription: "Mail",
      tier: "Cloud Plane",
      icon: "mdi:cloud",
      iconBg: "#dbeafe",
      iconColor: "#2563eb",
      status: "unknown"
    },
    {
      serviceId: "vercel",
      serviceName: "Vercel",
      serviceDescription: "Vercel Homepage",
      tier: "Cloud Plane",
      icon: "mdi:triangle",
      iconBg: "#0a0a0a",
      iconColor: "#ffffff",
      status: "unknown"
    },
    {
      serviceId: "amazon-glacier",
      serviceName: "Amazon Glacier",
      serviceDescription: "Cold Storage",
      tier: "Cloud Plane",
      serviceType: "database",
      icon: "mdi:snowflake",
      iconBg: "#dbeafe",
      iconColor: "#0ea5e9",
      status: "unknown"
    },
    // Home Infrastructure - Servers
    {
      serviceId: "lb",
      serviceName: "s01 Load Balancer",
      serviceDescription: "HTTPS Traffic Distribution",
      tier: "Data Plane",
      serviceType: "server",
      serviceLabel: "s01",
      status: "unknown"
    },
    {
      serviceId: "serviceExit",
      serviceName: "Service Exit",
      serviceDescription: "Non HTTP Traffic",
      tier: "Data Plane",
      serviceType: "server",
      serviceLabel: "s01",
      status: "unknown"
    },
    // Home Services - s01 group
    {
      serviceId: "core-data-storage",
      serviceName: "Core Data Storage",
      serviceDescription: "Core Data Storage",
      tier: "Control Plane s01",
      serviceType: "database",
      status: "unknown"
    },
    {
      serviceId: "arozos-1",
      serviceName: "arozos",
      serviceDescription: "Arozos",
      tier: "Control Plane s01",
      icon: "mdi:cube",
      iconBg: "#e9d5ff",
      iconColor: "#9333ea",
      status: "unknown"
    },
    {
      serviceId: "s01-web",
      serviceName: "Core Web Server",
      serviceDescription: "Services",
      tier: "Control Plane s01",
      icon: "mdi:microsoft-windows",
      iconBg: "#e9d5ff",
      iconColor: "#9333ea",
      status: "unknown"
    },
    {
      serviceId: "cas",
      serviceName: "Central Authentication Service",
      serviceDescription: "oAuth System",
      tier: "Control Plane s01",
      icon: "mdi:shield-account",
      iconBg: "#e9d5ff",
      iconColor: "#9333ea",
      status: "unknown"
    },

    // Home Services - s02 group
    {
      serviceId: "jenkins",
      serviceName: "Jenkins",
      serviceDescription: "Jenkins CI/CD",
      tier: "Control Plane s01",
      icon: "mdi:hammer-wrench",
      iconBg: "#fef3c7",
      iconColor: "#f59e0b",
      status: "unknown"
    },
    {
      serviceId: "arozos-2",
      serviceName: "arozos",
      serviceDescription: "arozos",
      tier: "Control Plane s02",
      icon: "mdi:cube",
      iconBg: "#fef3c7",
      iconColor: "#f59e0b",
      status: "unknown"
    },
    {
      serviceId: "gitlab",
      serviceName: "Gitlab",
      serviceDescription: "Gitlab",
      tier: "Control Plane s02",
      icon: "mdi:gitlab",
      iconBg: "#fef3c7",
      iconColor: "#f59e0b",
      status: "unknown"
    },

    // Home Services - s03 group
    {
      serviceId: "gogs",
      serviceName: "gogs",
      serviceDescription: "HKWTC Git gogs",
      tier: "Control Plane s03",
      icon: "mdi:git",
      iconBg: "#dcfce7",
      iconColor: "#16a34a",
      status: "unknown"
    },
    {
      serviceId: "minecraft-25565",
      serviceName: "Minecraft 25565",
      serviceDescription: "Minecraft server 25565",
      tier: "Control Plane s03",
      icon: "mdi:minecraft",
      iconBg: "#dcfce7",
      iconColor: "#16a34a",
      status: "unknown"
    },
    {
      serviceId: "minecraft-25566",
      serviceName: "Minecraft 25566",
      serviceDescription: "Minecraft server 25566",
      tier: "Control Plane s03",
      icon: "mdi:minecraft",
      iconBg: "#dcfce7",
      iconColor: "#16a34a",
      status: "unknown"
    },
  ],
  connections: [
    // User to CloudFlare
    ["user", "cloudflare", "-"],

    // CloudFlare to iCloud
    ["user", "icloud", "-"],

        ["user", "vercel", "-"],
    ["user", "amazon-glacier", "-"],


    // CloudFlare to home servers
    ["cloudflare", "lb", "15ms"],
    ["lb", "arozos-1", "-"],
    ["lb", "arozos-2", "-"],
    ["lb", "cas", "-"],
    ["lb", "s01-web", "-"],
    ["lb", "jenkins", "-"],
    ["lb", "gitlab", "-"],
    ["lb", "gogs", "-"],
    ["amazon-glacier", "core-data-storage", "-"],
    ["serviceExit", "minecraft-25565", "-"],
    ["serviceExit", "minecraft-25566", "-"],
    ["user", "serviceExit", "-"]
  ]
};

export default function Page() {

    return (
        <>
          <div className="flex-1">
            <div className="pt-5">
              <main className="mt-10 flex w-full flex-col">
                <div className="relative w-full overflow-hidden">
                  <div className="w-full">
                    <div className="mx-auto mt-14 max-w-3xl px-4 lg:mt-20 lg:px-0 2xl:max-w-4xl">
                      <header className="mb-6 sm:mb-8 md:mb-10">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 dark:text-white">Architecture</h1>
                        <h3 className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300">Infrastructure Overview</h3>
                      </header>
                      <ArchitectureSection config={infrastructureConfig} />
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
          <RealFooter />
        </>
    )
}

const ArchitectureSection: React.FC<{ config: typeof infrastructureConfig }> = ({ config }) => {
  return (
    <BottomToUpTransitionView duration={80}>
      <motion.div
        className="border border-gray-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-neutral-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <ThreeTierInfrastructure config={config} />
      </motion.div>
    </BottomToUpTransitionView>
  )
}
