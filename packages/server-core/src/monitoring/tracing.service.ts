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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023
Infinite Reality Engine. All Rights Reserved.
*/

import { Application } from '@feathersjs/koa'
import { context, Span, SpanStatusCode, trace } from '@opentelemetry/api'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { ParentBasedSampler, TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-node'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { Context, Next } from 'koa'

import { logger } from '../ServerLogger'
import { default as config } from '../appconfig'

/**
 * Initialize OpenTelemetry SDK
 */
function initializeSDK(serviceName: string): { sdk: NodeSDK; tracer: any } {
  if (!config.monitoring?.tracing?.enabled) {
    logger.info('Tracing is disabled')
    return { sdk: null as any, tracer: null }
  }

  // Create trace exporter
  const traceExporter = new OTLPTraceExporter({
    url: config.monitoring.tracing.endpoint
  })

  // Configure a sampling strategy
  const sampler = new ParentBasedSampler({
    root: new TraceIdRatioBasedSampler(config.monitoring.tracing.samplingRatio)
  })

  // Add custom attributes based on environment
  const customAttributes: Record<string, string> = {
    'ir_engine.version': process.env.npm_package_version || '1.0.0',
    'ir_engine.environment': process.env.NODE_ENV || 'development'
  }

  // Add GCP-specific attributes if using Cloud Trace
  if (config.monitoring.tracing.useCloudTrace && config.gcp.project) {
    customAttributes['gcp.project.id'] = config.gcp.project
  }

  // Create SDK
  const sdk = new NodeSDK({
    resource: new resources.Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
      ...customAttributes
    }),
    traceExporter,
    spanProcessor: new BatchSpanProcessor(traceExporter),
    sampler,
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': { enabled: true },
        '@opentelemetry/instrumentation-http': { enabled: true },
        '@opentelemetry/instrumentation-express': { enabled: true },
        '@opentelemetry/instrumentation-koa': { enabled: true },
        '@opentelemetry/instrumentation-mysql2': { enabled: true },
        '@opentelemetry/instrumentation-redis': { enabled: true },
        '@opentelemetry/instrumentation-winston': { enabled: true },
        '@opentelemetry/instrumentation-pino': { enabled: true }
      })
    ]
  })

  // Get tracer
  const tracer = trace.getTracer(serviceName)

  logger.info('Tracing service initialized')
  return { sdk, tracer }
}

/**
 * Create a custom span
 * @param tracer - OpenTelemetry tracer
 * @param name - Name of the span
 * @param fn - Function to execute within the span
 * @param attributes - Span attributes
 */
async function createSpan<T>(
  tracer: any,
  name: string,
  fn: (span: Span) => Promise<T>,
  attributes: Record<string, any> = {}
): Promise<T> {
  if (!config.monitoring?.tracing?.enabled) return fn({} as Span)

  return await tracer.startActiveSpan(name, { attributes }, async (span: Span) => {
    try {
      const result = await fn(span)
      span.setStatus({ code: SpanStatusCode.OK })
      return result
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : String(error)
      })
      throw error
    } finally {
      span.end()
    }
  })
}

/**
 * Create a span for file upload operations
 * @param tracer - OpenTelemetry tracer
 * @param fileName - Name of the uploaded file
 * @param fileType - Type/category of file
 * @param mimeType - MIME type of the file
 * @param sizeBytes - Size of the file in bytes
 * @param project - Project name (optional)
 * @param fn - Function to execute within the span
 */
async function createFileUploadSpan<T>(
  tracer: any,
  fileName: string,
  fileType: string,
  mimeType: string,
  sizeBytes: number,
  project: string | undefined,
  fn: (span: Span) => Promise<T>
): Promise<T> {
  if (!config.monitoring?.tracing?.enabled) return fn({} as Span)

  const attributes = {
    'file.name': fileName,
    'file.type': fileType,
    'file.mime_type': mimeType,
    'file.size_bytes': sizeBytes,
    'file.project': project || 'unknown',
    'operation.type': 'file_upload'
  }

  return await tracer.startActiveSpan(`File Upload: ${fileName}`, { attributes }, async (span: Span) => {
    try {
      const result = await fn(span)
      span.setStatus({ code: SpanStatusCode.OK })
      span.setAttributes({
        'upload.status': 'success'
      })
      return result
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : String(error)
      })
      span.setAttributes({
        'upload.status': 'failed',
        'error.message': error instanceof Error ? error.message : String(error)
      })
      throw error
    } finally {
      span.end()
    }
  })
}

/**
 * Create tracing middleware for HTTP requests
 * @param tracer - OpenTelemetry tracer
 */
function createTracingMiddleware(tracer: any) {
  return async (ctx: Context, next: Next): Promise<void> => {
    if (!config.monitoring?.tracing?.enabled) {
      await next()
      return
    }

    const requestSpan = tracer.startSpan(`HTTP ${ctx.method} ${ctx.path}`, {
      attributes: {
        'http.method': ctx.method,
        'http.url': ctx.url,
        'http.host': ctx.host,
        'http.scheme': ctx.protocol,
        'http.target': ctx.path,
        'http.user_agent': ctx.get('user-agent'),
        'http.request_content_length': ctx.get('content-length'),
        'http.flavor': `${ctx.req.httpVersionMajor}.${ctx.req.httpVersionMinor}`
      }
    })

    return context.with(trace.setSpan(context.active(), requestSpan), async () => {
      try {
        await next()
        requestSpan.setStatus({ code: SpanStatusCode.OK })
      } catch (error) {
        requestSpan.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : String(error)
        })
        throw error
      } finally {
        requestSpan.setAttributes({
          'http.status_code': ctx.status
        })
        requestSpan.end()
      }
    })
  }
}

/**
 * Configure tracing for the application
 */
export default (options = {}) => {
  return (app: Application): void => {
    if (!config.monitoring?.tracing?.enabled) {
      logger.info('Tracing is disabled')
      return
    }

    const serviceName = app.get('name') || 'ir-engine-api'
    const { sdk, tracer } = initializeSDK(serviceName)

    if (!sdk || !tracer) return

    // Add tracing middleware
    app.use(createTracingMiddleware(tracer))

    // Start tracing
    sdk.start()
    logger.info('OpenTelemetry tracing started')

    // Store tracing utilities in app for later use
    app.set('tracingSDK', sdk)
    app.set('tracer', tracer)
    app.set('createSpan', (name: string, fn: (span: Span) => Promise<any>, attributes?: Record<string, any>) =>
      createSpan(tracer, name, fn, attributes)
    )
    app.set(
      'createFileUploadSpan',
      (
        fileName: string,
        fileType: string,
        mimeType: string,
        sizeBytes: number,
        project: string | undefined,
        fn: (span: Span) => Promise<any>
      ) => createFileUploadSpan(tracer, fileName, fileType, mimeType, sizeBytes, project, fn)
    )

    // Handle shutdown
    process.on('SIGTERM', () => {
      sdk
        .shutdown()
        .then(() => {
          logger.info('OpenTelemetry tracing stopped')
        })
        .catch((error) => {
          logger.error('Error shutting down OpenTelemetry tracing', error)
        })
    })

    logger.info('Tracing service configured')
  }
}
