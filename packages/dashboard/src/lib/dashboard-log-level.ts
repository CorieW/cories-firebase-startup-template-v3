/**
 * Dashboard log-level helpers shared between route loaders and server env consumers.
 */
import {
  default as commonLogging,
  type LogSeverity,
} from '@cories-firebase-startup-template-v3/common/logging'
import { createServerFn } from '@tanstack/react-start'

function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === 'production'
}

function readDashboardLogLevelEnv(): string | undefined {
  const value = process.env.DASHBOARD_LOG_LEVEL?.trim()
  return value && value.length > 0 ? value : undefined
}

const { parseLogSeverity } = commonLogging
export function getDashboardLogLevel(): LogSeverity {
  return parseLogSeverity(
    readDashboardLogLevelEnv(),
    isProductionEnvironment() ? 'info' : 'debug'
  )
}

export const getDashboardLogLevelServer = createServerFn({
  method: 'GET',
}).handler(async () => getDashboardLogLevel())
