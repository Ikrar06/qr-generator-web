// src/app/api/generate-qr/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { 
  QRGenerationRequest, 
  QRGenerationResponse, 
  APIError,
  QRMode,
  OutputFormat 
} from '@/types/qr-types';
import { formatErrorMessage, generateUniqueFilename } from '@/lib/utils';
import { logAPIRequest, logAPIError, measurePerformance } from '@/lib/server-utils';

// Mock constants until they're available
const ERROR_MESSAGES = {
  EMPTY_DATA: 'Data cannot be empty',
  DATA_TOO_LONG: 'Data exceeds maximum length',
  GENERATION_FAILED: 'QR code generation failed',
  UNKNOWN_ERROR: 'An unknown error occurred'
};

const QR_LIMITS = {
  MAX_DATA_LENGTH: 4296,
  MIN_SIZE: 64,
  MAX_SIZE: 2048,
  MIN_MARGIN: 0,
  MAX_MARGIN: 20,
  MIN_QUALITY: 0.1,
  MAX_QUALITY: 1.0
};

// Configure route segment options
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30; // 30 seconds timeout

/**
 * Handle POST request for QR code generation
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let requestId: string | undefined;
  
  try {
    // Generate unique request ID for tracking
    requestId = generateUniqueFilename('req');
    
    // Parse and validate request body
    const body = await parseRequestBody(request);
    const validationResult = validateGenerationRequest(body);
    
    if (!validationResult.isValid) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        validationResult.errors.join(', '),
        400,
        requestId,
        startTime
      );
    }

    // Log incoming request
    await logAPIRequest(request, requestId, {
      mode: body.mode,
      dataLength: body.data?.length || 0,
      hasOptions: !!body.options
    });

    // Create QR generation request
    const qrRequest: QRGenerationRequest = {
      data: body.data,
      mode: body.mode,
      options: body.options || {},
      filename: body.filename
    };

    // For now, we'll create a mock response since QRGenerator might not be ready
    const result = await measurePerformance(
      'qr_generation',
      () => generateMockQR(qrRequest)
    );

    // Check if generation was successful
    if (!result.success) {
      return createErrorResponse(
        'GENERATION_ERROR',
        result.error || ERROR_MESSAGES.GENERATION_FAILED,
        500,
        requestId,
        startTime
      );
    }

    // Create successful response
    const response = createSuccessResponse(result, requestId, startTime);
    
    return response;

  } catch (error) {
    // Log error for debugging
    await logAPIError(error, requestId, request);

    // Return generic error response
    return createErrorResponse(
      'INTERNAL_ERROR',
      ERROR_MESSAGES.UNKNOWN_ERROR,
      500,
      requestId,
      startTime
    );
  }
}

/**
 * Handle GET request for API documentation/health check
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'QR Generation API is active',
    version: '1.0.0',
    endpoints: {
      'POST /api/generate-qr': 'Generate QR code',
      'GET /api/generate-qr': 'API documentation',
      'GET /api/health': 'Health check'
    },
    supportedModes: Object.values(QRMode),
    supportedFormats: Object.values(OutputFormat),
    limits: QR_LIMITS,
    timestamp: Date.now()
  }, {
    headers: {
      'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
    }
  });
}

/**
 * Handle OPTIONS request for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400' // 24 hours
    }
  });
}

/**
 * Parse and validate request body
 */
async function parseRequestBody(request: NextRequest): Promise<any> {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      return await request.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      const body: any = {};
      
      formData.forEach((value, key) => {
        if (key === 'options' && typeof value === 'string') {
          try {
            body[key] = JSON.parse(value);
          } catch {
            body[key] = {};
          }
        } else {
          body[key] = value;
        }
      });
      
      return body;
    } else {
      throw new Error('Unsupported content type');
    }
  } catch (error) {
    throw new Error(`Failed to parse request body: ${formatErrorMessage(error)}`);
  }
}

/**
 * Validate QR generation request
 */
function validateGenerationRequest(body: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  if (!body || typeof body !== 'object') {
    errors.push('Request body must be a valid object');
    return { isValid: false, errors };
  }

  if (!body.data || typeof body.data !== 'string') {
    errors.push('Data field is required and must be a string');
  } else if (body.data.trim().length === 0) {
    errors.push(ERROR_MESSAGES.EMPTY_DATA);
  } else if (body.data.length > QR_LIMITS.MAX_DATA_LENGTH) {
    errors.push(`${ERROR_MESSAGES.DATA_TOO_LONG} (${body.data.length}/${QR_LIMITS.MAX_DATA_LENGTH})`);
  }

  if (!body.mode || !Object.values(QRMode).includes(body.mode)) {
    errors.push('Valid mode is required (basic, colored, svg, hq)');
  }

  // Validate options if provided
  if (body.options && typeof body.options === 'object') {
    const optionErrors = validateQROptions(body.options);
    errors.push(...optionErrors);
  }

  // Validate filename if provided
  if (body.filename && typeof body.filename !== 'string') {
    errors.push('Filename must be a string');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate QR options
 */
function validateQROptions(options: any): string[] {
  const errors: string[] = [];

  if (options.width !== undefined) {
    if (typeof options.width !== 'number' || options.width < QR_LIMITS.MIN_SIZE || options.width > QR_LIMITS.MAX_SIZE) {
      errors.push(`Width must be between ${QR_LIMITS.MIN_SIZE} and ${QR_LIMITS.MAX_SIZE} pixels`);
    }
  }

  if (options.height !== undefined) {
    if (typeof options.height !== 'number' || options.height < QR_LIMITS.MIN_SIZE || options.height > QR_LIMITS.MAX_SIZE) {
      errors.push(`Height must be between ${QR_LIMITS.MIN_SIZE} and ${QR_LIMITS.MAX_SIZE} pixels`);
    }
  }

  if (options.margin !== undefined) {
    if (typeof options.margin !== 'number' || options.margin < QR_LIMITS.MIN_MARGIN || options.margin > QR_LIMITS.MAX_MARGIN) {
      errors.push(`Margin must be between ${QR_LIMITS.MIN_MARGIN} and ${QR_LIMITS.MAX_MARGIN}`);
    }
  }

  if (options.quality !== undefined) {
    if (typeof options.quality !== 'number' || options.quality < QR_LIMITS.MIN_QUALITY || options.quality > QR_LIMITS.MAX_QUALITY) {
      errors.push(`Quality must be between ${QR_LIMITS.MIN_QUALITY} and ${QR_LIMITS.MAX_QUALITY}`);
    }
  }

  if (options.color && typeof options.color === 'object') {
    if (options.color.dark && typeof options.color.dark !== 'string') {
      errors.push('Dark color must be a valid color string');
    }
    if (options.color.light && typeof options.color.light !== 'string') {
      errors.push('Light color must be a valid color string');
    }
  }

  return errors;
}

/**
 * Create success response
 */
function createSuccessResponse(
  result: QRGenerationResponse, 
  requestId: string, 
  startTime: number
): NextResponse {
  const processingTime = Date.now() - startTime;
  
  return NextResponse.json({
    success: true,
    data: result,
    meta: {
      requestId,
      processingTime,
      timestamp: Date.now(),
      version: '1.0.0'
    }
  }, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'X-Request-ID': requestId,
      'X-Processing-Time': processingTime.toString(),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}

/**
 * Create error response
 */
function createErrorResponse(
  code: string,
  message: string,
  status: number,
  requestId?: string,
  startTime?: number
): NextResponse {
  const processingTime = startTime ? Date.now() - startTime : 0;
  
  const errorResponse: APIError = {
    code,
    message,
    timestamp: Date.now(),
    requestId
  };

  return NextResponse.json({
    success: false,
    error: errorResponse,
    meta: {
      requestId,
      processingTime,
      timestamp: Date.now(),
      version: '1.0.0'
    }
  }, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'X-Request-ID': requestId || 'unknown',
      'X-Processing-Time': processingTime.toString(),
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}

/**
 * Mock QR generation function (to be replaced with actual QR generator)
 */
async function generateMockQR(request: QRGenerationRequest): Promise<QRGenerationResponse> {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 100));

  return {
    success: true,
    data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', // 1x1 transparent PNG
    filename: request.filename || `qr-${Date.now()}.png`,
    format: OutputFormat.PNG,
    size: {
      width: request.options?.width || 256,
      height: request.options?.height || 256
    },
    timestamp: Date.now()
  };
}

/**
 * Handle rate limiting (placeholder for future implementation)
 */
function checkRateLimit(request: NextRequest): { allowed: boolean; resetTime?: number } {
  // TODO: Implement rate limiting logic
  // For now, always allow requests
  return { allowed: true };
}

/**
 * Get client IP address for rate limiting and logging
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return realIP || cfConnectingIP || 'unknown';
}

/**
 * Validate content type
 */
function isValidContentType(contentType: string): boolean {
  const validTypes = [
    'application/json',
    'application/x-www-form-urlencoded',
    'multipart/form-data'
  ];
  
  return validTypes.some(type => contentType.includes(type));
}