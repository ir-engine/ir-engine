/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { Application } from '@feathersjs/koa'
import { Context, Next } from 'koa'
import * as promClient from 'prom-client'

import { buildStatusPath } from '@ir-engine/common/src/schemas/cluster/build-status.schema'
import { logger } from '../ServerLogger'

/**
 * MetricsService class for handling Prometheus metrics
 */
export class MetricsService {
  private app: Application
  private registry: promClient.Registry

  // HTTP metrics
  private httpRequestDurationMicroseconds: promClient.Histogram<string>
  private httpRequestsTotal: promClient.Counter<string>
  private httpRequestsInProgress: promClient.Gauge<string>

  // WebSocket metrics
  private wsConnectionsTotal: promClient.Counter<string>
  private wsConnectionsActive: promClient.Gauge<string>
  private wsMessagesTotal: promClient.Counter<string>

  // User metrics
  public usersTotal: promClient.Gauge<string>
  public usersActive: promClient.Gauge<string>
  public usersCreators: promClient.Gauge<string>
  public userRegistrations: promClient.Counter<string>
  public userLogins: promClient.Counter<string>

  // World and scene metrics
  public worldsTotal: promClient.Gauge<string>
  public scenesTotal: promClient.Gauge<string>
  public worldVisits: promClient.Counter<string>
  public worldActiveVisitors: promClient.Gauge<string>

  // Project metrics
  public projectsTotal: promClient.Gauge<string>
  public projectsCreated: promClient.Counter<string>

  // Instance metrics
  public instancesActive: promClient.Gauge<string>
  public instanceAttendanceTotal: promClient.Counter<string>
  public instanceAttendanceActive: promClient.Gauge<string>

  // Build status metrics
  public buildStatusTotal: promClient.Counter<string>
  public buildStatusByStatus: promClient.Counter<string>
  public buildStatusInProgress: promClient.Gauge<string>
  public buildStatusDuration: promClient.Histogram<string>

  // File upload metrics
  public fileUploadsTotal: promClient.Counter<string>
  public fileUploadSizeBytes: promClient.Histogram<string>
  public fileUploadDuration: promClient.Histogram<string>
  public fileUploadsByType: promClient.Counter<string>

  /**
   * Constructor for MetricsService
   * @param app - Feathers application instance
   */
  constructor(app: Application) {
    this.app = app
    this.registry = new promClient.Registry()

    // Add default metrics (CPU, memory, etc.)
    promClient.collectDefaultMetrics({
      register: this.registry,
      prefix: 'ir_engine_'
    })

    // Create HTTP metrics
    this.httpRequestDurationMicroseconds = new promClient.Histogram({
      name: 'ir_engine_http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10]
    })

    this.httpRequestsTotal = new promClient.Counter({
      name: 'ir_engine_http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code']
    })

    this.httpRequestsInProgress = new promClient.Gauge({
      name: 'ir_engine_http_requests_in_progress',
      help: 'Number of HTTP requests in progress',
      labelNames: ['method', 'route']
    })

    // Create WebSocket metrics
    this.wsConnectionsTotal = new promClient.Counter({
      name: 'ir_engine_ws_connections_total',
      help: 'Total number of WebSocket connections',
      labelNames: ['status']
    })

    this.wsConnectionsActive = new promClient.Gauge({
      name: 'ir_engine_ws_connections_active',
      help: 'Number of active WebSocket connections'
    })

    this.wsMessagesTotal = new promClient.Counter({
      name: 'ir_engine_ws_messages_total',
      help: 'Total number of WebSocket messages',
      labelNames: ['direction', 'type']
    })

    // Initialize user metrics
    this.usersTotal = new promClient.Gauge({
      name: 'ir_engine_users_total',
      help: 'Total number of registered users',
      registers: [this.registry]
    })

    this.usersActive = new promClient.Gauge({
      name: 'ir_engine_users_active',
      help: 'Number of active users in the last 24 hours',
      registers: [this.registry]
    })

    this.usersCreators = new promClient.Gauge({
      name: 'ir_engine_users_creators',
      help: 'Number of users who have created content',
      registers: [this.registry]
    })

    this.userRegistrations = new promClient.Counter({
      name: 'ir_engine_user_registrations_total',
      help: 'Total number of user registrations',
      registers: [this.registry]
    })

    this.userLogins = new promClient.Counter({
      name: 'ir_engine_user_logins_total',
      help: 'Total number of user logins',
      registers: [this.registry]
    })

    // Initialize world and scene metrics
    this.worldsTotal = new promClient.Gauge({
      name: 'ir_engine_worlds_total',
      help: 'Total number of worlds',
      registers: [this.registry]
    })

    this.scenesTotal = new promClient.Gauge({
      name: 'ir_engine_scenes_total',
      help: 'Total number of scenes',
      registers: [this.registry]
    })

    this.worldVisits = new promClient.Counter({
      name: 'ir_engine_world_visits_total',
      help: 'Total number of world visits',
      labelNames: ['world_id'],
      registers: [this.registry]
    })

    this.worldActiveVisitors = new promClient.Gauge({
      name: 'ir_engine_world_active_visitors',
      help: 'Number of active visitors in worlds',
      labelNames: ['world_id'],
      registers: [this.registry]
    })

    // Initialize project metrics
    this.projectsTotal = new promClient.Gauge({
      name: 'ir_engine_projects_total',
      help: 'Total number of projects',
      registers: [this.registry]
    })

    this.projectsCreated = new promClient.Counter({
      name: 'ir_engine_projects_created_total',
      help: 'Total number of projects created',
      registers: [this.registry]
    })

    // Initialize instance metrics
    this.instancesActive = new promClient.Gauge({
      name: 'ir_engine_instances_active',
      help: 'Number of active instances',
      registers: [this.registry]
    })

    this.instanceAttendanceTotal = new promClient.Counter({
      name: 'ir_engine_instance_attendance_total',
      help: 'Total number of instance attendances',
      labelNames: ['instance_id'],
      registers: [this.registry]
    })

    this.instanceAttendanceActive = new promClient.Gauge({
      name: 'ir_engine_instance_attendance_active',
      help: 'Number of active attendances in instances',
      labelNames: ['instance_id'],
      registers: [this.registry]
    })

    // Initialize build status metrics
    this.buildStatusTotal = new promClient.Counter({
      name: 'ir_engine_build_status_total',
      help: 'Total number of builds',
      registers: [this.registry]
    })

    this.buildStatusByStatus = new promClient.Counter({
      name: 'ir_engine_build_status_by_status_total',
      help: 'Total number of builds by status',
      labelNames: ['status'],
      registers: [this.registry]
    })

    this.buildStatusInProgress = new promClient.Gauge({
      name: 'ir_engine_build_status_in_progress',
      help: 'Number of builds currently in progress',
      registers: [this.registry]
    })

    this.buildStatusDuration = new promClient.Histogram({
      name: 'ir_engine_build_status_duration_seconds',
      help: 'Duration of builds in seconds',
      labelNames: ['status'],
      buckets: [60, 300, 600, 1800, 3600, 7200, 14400], // 1min, 5min, 10min, 30min, 1h, 2h, 4h
      registers: [this.registry]
    })

    // Initialize file upload metrics
    this.fileUploadsTotal = new promClient.Counter({
      name: 'ir_engine_file_uploads_total',
      help: 'Total number of file uploads',
      labelNames: ['type', 'status', 'project'],
      registers: [this.registry]
    })

    this.fileUploadSizeBytes = new promClient.Histogram({
      name: 'ir_engine_file_upload_size_bytes',
      help: 'Size of uploaded files in bytes',
      labelNames: ['type', 'project'],
      buckets: [1024, 10240, 102400, 1048576, 10485760, 104857600, 1073741824], // 1KB, 10KB, 100KB, 1MB, 10MB, 100MB, 1GB
      registers: [this.registry]
    })

    this.fileUploadDuration = new promClient.Histogram({
      name: 'ir_engine_file_upload_duration_seconds',
      help: 'Duration of file uploads in seconds',
      labelNames: ['type', 'project'],
      buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60], // 100ms to 1 minute
      registers: [this.registry]
    })

    this.fileUploadsByType = new promClient.Counter({
      name: 'ir_engine_file_uploads_by_type_total',
      help: 'Total number of file uploads by MIME type',
      labelNames: ['mime_type', 'file_extension', 'project'],
      registers: [this.registry]
    })

    // Register HTTP and WebSocket metrics
    this.registry.registerMetric(this.httpRequestDurationMicroseconds)
    this.registry.registerMetric(this.httpRequestsTotal)
    this.registry.registerMetric(this.httpRequestsInProgress)
    this.registry.registerMetric(this.wsConnectionsTotal)
    this.registry.registerMetric(this.wsConnectionsActive)
    this.registry.registerMetric(this.wsMessagesTotal)

    // Register user metrics
    this.registry.registerMetric(this.usersTotal)
    this.registry.registerMetric(this.usersActive)
    this.registry.registerMetric(this.usersCreators)
    this.registry.registerMetric(this.userRegistrations)
    this.registry.registerMetric(this.userLogins)

    // Register world and scene metrics
    this.registry.registerMetric(this.worldsTotal)
    this.registry.registerMetric(this.scenesTotal)
    this.registry.registerMetric(this.worldVisits)
    this.registry.registerMetric(this.worldActiveVisitors)

    // Register project metrics
    this.registry.registerMetric(this.projectsTotal)
    this.registry.registerMetric(this.projectsCreated)

    // Register instance metrics
    this.registry.registerMetric(this.instancesActive)
    this.registry.registerMetric(this.instanceAttendanceTotal)
    this.registry.registerMetric(this.instanceAttendanceActive)

    // Register build status metrics
    this.registry.registerMetric(this.buildStatusTotal)
    this.registry.registerMetric(this.buildStatusByStatus)
    this.registry.registerMetric(this.buildStatusInProgress)
    this.registry.registerMetric(this.buildStatusDuration)

    // Register file upload metrics
    this.registry.registerMetric(this.fileUploadsTotal)
    this.registry.registerMetric(this.fileUploadSizeBytes)
    this.registry.registerMetric(this.fileUploadDuration)
    this.registry.registerMetric(this.fileUploadsByType)

    // Add environment labels to all metrics
    this.registry.setDefaultLabels({
      environment: process.env.NODE_ENV || 'development',
      service: app.get('name') || 'ir-engine-api'
    })

    logger.info('Metrics service initialized with application-specific metrics')
  }

  /**
   * HTTP metrics middleware
   */
  public httpMetricsMiddleware = async (ctx: Context, next: Next): Promise<void> => {
    if (process.env.PROMETHEUS_METRICS_ENABLED !== 'true') {
      await next()
      return
    }

    // Determine if this is a Feathers service call or regular HTTP route
    const isFeathersService =
      ctx.path.startsWith('/') && ctx.path !== '/health' && ctx.path !== '/openapi' && ctx.path !== '/metrics'
    const route = this.getRouteLabel(ctx.path, ctx.method, isFeathersService)
    const method = ctx.method

    // Increment in-progress requests counter
    this.httpRequestsInProgress.inc({ method, route })

    // Start timer
    const startTime = process.hrtime()

    try {
      // Process request
      await next()
    } finally {
      // Calculate request duration
      const [seconds, nanoseconds] = process.hrtime(startTime)
      const duration = seconds + nanoseconds / 1e9

      // Record metrics
      const statusCode = ctx.status.toString()
      this.httpRequestDurationMicroseconds.observe({ method, route, status_code: statusCode }, duration)
      this.httpRequestsTotal.inc({ method, route, status_code: statusCode })
      this.httpRequestsInProgress.dec({ method, route })
    }
  }

  /**
   * Get a meaningful route label for metrics
   */
  private getRouteLabel(path: string, method: string, isFeathersService: boolean): string {
    // Handle static routes
    if (path === '/health') return 'health'
    if (path === '/openapi') return 'openapi'
    if (path === '/metrics') return 'metrics'
    if (path.startsWith('/oauth')) return 'oauth'

    // Handle Feathers service routes
    if (isFeathersService) {
      // Remove leading slash and extract service name
      const pathParts = path.substring(1).split('/')
      const serviceName = pathParts[0]

      // Map HTTP methods to Feathers service methods
      const serviceMethod = this.mapHttpMethodToFeathersMethod(method, pathParts)

      return `${serviceName}.${serviceMethod}`
    }

    // Fallback to path for unknown routes
    return path
  }

  /**
   * Map HTTP method and path to Feathers service method
   */
  private mapHttpMethodToFeathersMethod(httpMethod: string, pathParts: string[]): string {
    const hasId = pathParts.length > 1 && pathParts[1] !== ''

    switch (httpMethod.toUpperCase()) {
      case 'GET':
        return hasId ? 'get' : 'find'
      case 'POST':
        return 'create'
      case 'PUT':
      case 'PATCH':
        return hasId ? 'patch' : 'update'
      case 'DELETE':
        return hasId ? 'remove' : 'remove'
      default:
        return httpMethod.toLowerCase()
    }
  }

  /**
   * Metrics endpoint handler
   */
  public metricsEndpoint = async (ctx: Context): Promise<void> => {
    ctx.set('Content-Type', this.registry.contentType)
    ctx.body = await this.registry.metrics()
  }

  /**
   * Track WebSocket connection
   */
  public trackWebSocketConnection(status: 'connected' | 'disconnected'): void {
    if (process.env.PROMETHEUS_METRICS_ENABLED !== 'true') return

    this.wsConnectionsTotal.inc({ status })

    if (status === 'connected') {
      this.wsConnectionsActive.inc()
    } else {
      this.wsConnectionsActive.dec()
    }
  }

  /**
   * Track WebSocket message
   */
  public trackWebSocketMessage(direction: 'incoming' | 'outgoing', type: string): void {
    if (process.env.PROMETHEUS_METRICS_ENABLED !== 'true') return

    this.wsMessagesTotal.inc({ direction, type })
  }

  /**
   * Track user registration
   */
  public trackUserRegistration(): void {
    if (process.env.PROMETHEUS_METRICS_ENABLED !== 'true') return

    this.userRegistrations.inc()
  }

  /**
   * Track user login
   */
  public trackUserLogin(): void {
    if (process.env.PROMETHEUS_METRICS_ENABLED !== 'true') return

    this.userLogins.inc()
  }

  /**
   * Track world visit
   */
  public trackWorldVisit(worldId: string): void {
    if (process.env.PROMETHEUS_METRICS_ENABLED !== 'true') return

    this.worldVisits.inc({ world_id: worldId })
  }

  /**
   * Track instance attendance
   */
  public trackInstanceAttendance(instanceId: string): void {
    if (process.env.PROMETHEUS_METRICS_ENABLED !== 'true') return

    this.instanceAttendanceTotal.inc({ instance_id: instanceId })
  }

  /**
   * Track file upload
   * @param fileType - The type/category of file (e.g., 'avatar', 'scene', 'asset')
   * @param mimeType - The MIME type of the file
   * @param fileExtension - The file extension
   * @param sizeBytes - The size of the file in bytes
   * @param durationSeconds - The upload duration in seconds
   * @param project - The project name (optional)
   * @param status - Upload status ('success' or 'failed')
   */
  public trackFileUpload(
    fileType: string,
    mimeType: string,
    fileExtension: string,
    sizeBytes: number,
    durationSeconds: number,
    project?: string,
    status: 'success' | 'failed' = 'success'
  ): void {
    if (process.env.PROMETHEUS_METRICS_ENABLED !== 'true') return

    const projectLabel = project || 'unknown'

    // Track total uploads
    this.fileUploadsTotal.inc({ type: fileType, status, project: projectLabel })

    // Track file size (only for successful uploads)
    if (status === 'success') {
      this.fileUploadSizeBytes.observe({ type: fileType, project: projectLabel }, sizeBytes)
    }

    // Track upload duration
    this.fileUploadDuration.observe({ type: fileType, project: projectLabel }, durationSeconds)

    // Track by MIME type and extension
    this.fileUploadsByType.inc({
      mime_type: mimeType,
      file_extension: fileExtension,
      project: projectLabel
    })
  }

  /**
   * Track project creation
   */
  public trackProjectCreation(): void {
    if (process.env.PROMETHEUS_METRICS_ENABLED !== 'true') return

    this.projectsCreated.inc()
  }

  /**
   * Track build start
   */
  public trackBuildStart(): void {
    if (process.env.PROMETHEUS_METRICS_ENABLED !== 'true') return

    this.buildStatusTotal.inc()
    this.buildStatusByStatus.inc({ status: 'pending' })
    this.buildStatusInProgress.inc()
  }

  /**
   * Track build completion
   * @param status - The build status (success, failed, ended)
   * @param durationSeconds - The build duration in seconds
   */
  public trackBuildCompletion(status: string, durationSeconds: number): void {
    if (process.env.PROMETHEUS_METRICS_ENABLED !== 'true') return

    this.buildStatusByStatus.inc({ status })
    this.buildStatusInProgress.dec()
    this.buildStatusDuration.observe({ status }, durationSeconds)
  }

  /**
   * Update user metrics
   */
  public async updateUserMetrics(): Promise<void> {
    if (process.env.PROMETHEUS_METRICS_ENABLED !== 'true') return

    try {
      // Get total users count
      const totalUsers = await this.app.service('user').find({
        query: {
          $limit: 0
        }
      })

      // Get active users (users who logged in within the last 24 hours)
      const activeUsers = await this.app.service('user-login').find({
        query: {
          createdAt: {
            $gt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          },
          $limit: 0
        }
      })

      // Get creators (users who have created at least one project)
      const creators = await this.app.service('project-permission').find({
        query: {
          type: 'owner',
          $limit: 0
        }
      })

      this.usersTotal.set(totalUsers.total)
      this.usersActive.set(activeUsers.total)
      this.usersCreators.set(creators.total)
    } catch (error) {
      logger.error('Error updating user metrics', error)
    }
  }

  /**
   * Update world and scene metrics
   */
  public async updateWorldAndSceneMetrics(): Promise<void> {
    if (process.env.PROMETHEUS_METRICS_ENABLED !== 'true') return

    try {
      // Get total worlds count (locations)
      const totalLocations = await this.app.service('location').find({
        query: {
          $limit: 0
        }
      })

      // Get total scenes count
      const totalScenes = await this.app.service('scene').find({
        query: {
          $limit: 0
        }
      })

      this.worldsTotal.set(totalLocations.total)
      this.scenesTotal.set(totalScenes.total)

      // Get active world visitors
      const activeInstances = await this.app.service('instance').find({
        query: {
          ended: false,
          $limit: 0
        }
      })

      // Reset all world active visitors
      this.worldActiveVisitors.reset()

      // For each active instance, get the number of active attendances
      for (const instance of activeInstances.data) {
        const activeAttendances = await this.app.service('instance-attendance').find({
          query: {
            instanceId: instance.id,
            ended: false,
            $limit: 0
          }
        })

        if (instance.locationId) {
          this.worldActiveVisitors.set({ world_id: instance.locationId }, activeAttendances.total)
        }

        // Update instance attendance metrics
        this.instanceAttendanceActive.set({ instance_id: instance.id }, activeAttendances.total)
      }

      // Update active instances count
      this.instancesActive.set(activeInstances.total)
    } catch (error) {
      logger.error('Error updating world and scene metrics', error)
    }
  }

  /**
   * Update project metrics
   */
  public async updateProjectMetrics(): Promise<void> {
    if (process.env.PROMETHEUS_METRICS_ENABLED !== 'true') return

    try {
      // Get total projects count
      const totalProjects = await this.app.service('project').find({
        query: {
          $limit: 0
        }
      })

      this.projectsTotal.set(totalProjects.total)
    } catch (error) {
      logger.error('Error updating project metrics', error)
    }
  }

  /**
   * Update build status metrics
   */
  public async updateBuildStatusMetrics(): Promise<void> {
    if (process.env.PROMETHEUS_METRICS_ENABLED !== 'true') return

    try {
      // Count builds in progress (pending status)
      const pendingBuilds = await this.app.service(buildStatusPath).find({
        query: {
          status: 'pending',
          $limit: 0
        }
      })

      // Set the gauge for builds in progress
      this.buildStatusInProgress.set(pendingBuilds.total)

      // We don't need to update the counters here as they are incremented
      // when builds are started/completed via the track methods
    } catch (error) {
      logger.error('Error updating build status metrics', error)
    }
  }

  /**
   * Update all application metrics
   */
  public async updateAllMetrics(): Promise<void> {
    if (process.env.PROMETHEUS_METRICS_ENABLED !== 'true') return

    await Promise.all([
      this.updateUserMetrics(),
      this.updateWorldAndSceneMetrics(),
      this.updateProjectMetrics(),
      this.updateBuildStatusMetrics()
    ])
  }

  /**
   * Create Feathers hook for tracking service calls
   */
  public createServiceHook() {
    return (context: any) => {
      if (process.env.PROMETHEUS_METRICS_ENABLED !== 'true') return context

      const serviceName = context.path
      const method = context.method
      const route = `${serviceName}.${method}`
      const httpMethod = this.mapFeathersMethodToHttp(method)

      // Start timing
      const startTime = process.hrtime()

      // Track in-progress requests
      this.httpRequestsInProgress.inc({ method: httpMethod, route })

      // Add after hook to record completion
      context.app.hooks({
        after: {
          all: [
            (afterContext: any) => {
              if (afterContext.path === serviceName && afterContext.method === method) {
                const [seconds, nanoseconds] = process.hrtime(startTime)
                const duration = seconds + nanoseconds / 1e9
                const statusCode = afterContext.statusCode || '200'

                this.httpRequestDurationMicroseconds.observe(
                  { method: httpMethod, route, status_code: statusCode },
                  duration
                )
                this.httpRequestsTotal.inc({ method: httpMethod, route, status_code: statusCode })
                this.httpRequestsInProgress.dec({ method: httpMethod, route })
              }
              return afterContext
            }
          ]
        },
        error: {
          all: [
            (errorContext: any) => {
              if (errorContext.path === serviceName && errorContext.method === method) {
                const statusCode = errorContext.error?.code || '500'
                this.httpRequestsTotal.inc({ method: httpMethod, route, status_code: statusCode })
                this.httpRequestsInProgress.dec({ method: httpMethod, route })
              }
              return errorContext
            }
          ]
        }
      })

      return context
    }
  }

  /**
   * Map Feathers service method to HTTP method
   */
  private mapFeathersMethodToHttp(feathersMethod: string): string {
    switch (feathersMethod) {
      case 'find':
      case 'get':
        return 'GET'
      case 'create':
        return 'POST'
      case 'update':
      case 'patch':
        return 'PATCH'
      case 'remove':
        return 'DELETE'
      default:
        return 'GET'
    }
  }
}

/**
 * Configure metrics for the application
 */
export default (options = {}) => {
  return (app: Application): void => {
    // Check if metrics are enabled via environment variable
    if (process.env.PROMETHEUS_METRICS_ENABLED !== 'true') {
      logger.info('Prometheus metrics are disabled via environment configuration')
      return
    }

    logger.info('Prometheus metrics are enabled - initializing metrics service')

    const metricsService = new MetricsService(app)

    // Add metrics middleware
    app.use(metricsService.httpMetricsMiddleware)

    // Add metrics endpoint
    const metricsEndpoint = process.env.METRICS_ENDPOINT || '/metrics'
    app.use(async (ctx, next) => {
      if (ctx.path === metricsEndpoint) {
        await metricsService.metricsEndpoint(ctx)
      } else {
        await next()
      }
    })

    // Store metrics service in app for later use
    app.set('metricsService', metricsService)

    // Initialize application metrics
    metricsService.updateAllMetrics().catch((error) => {
      logger.error('Error initializing application metrics', error)
    })

    // Set up periodic metrics collection (every 5 minutes)
    const metricsUpdateInterval = parseInt(process.env.METRICS_UPDATE_INTERVAL_SECONDS || '300') * 1000
    setInterval(() => {
      metricsService.updateAllMetrics().catch((error) => {
        logger.error('Error updating application metrics', error)
      })
    }, metricsUpdateInterval)

    logger.info(`Metrics endpoint available at: ${metricsEndpoint}`)
    logger.info(`Application metrics will be updated every ${metricsUpdateInterval / 1000} seconds`)
  }
}
