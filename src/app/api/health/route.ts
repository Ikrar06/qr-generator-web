// src/app/api/health/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { 
  getHealthData, 
  getPerformanceStats, 
  getErrorStats,
  logAPIRequest 
} from '@/lib/server-utils';

// Mock APP_CONFIG if constants don't exist yet
const APP_CONFIG = {
  name: 'QR Generator Web',
  version: '1.0.0',
  description: 'Professional QR Code Generator Web Application'
};

// Configure route segment options
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 10; // 10 seconds timeout

/**
 * Handle GET request for health check
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `health_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  try {
    // Log the health check request
    await logAPIRequest(request, requestId, {
      endpoint: 'health'
    });

    // Get comprehensive health data
    const healthData = getHealthData();
    const processingTime = Date.now() - startTime;
    
    // Get dependency status with better error handling
    const dependencyStatus = await getDependencyStatus();
    
    // Determine overall health based on critical dependencies
    const isCriticalError = checkCriticalDependencies(dependencyStatus);
    const overallStatus = isCriticalError ? 'degraded' : healthData.status;
    const httpStatus = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

    // Create response data
    const responseData = {
      ...healthData,
      status: overallStatus,
      application: {
        name: APP_CONFIG.name,
        version: APP_CONFIG.version,
        description: APP_CONFIG.description,
        environment: process.env.NODE_ENV || 'unknown',
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch
      },
      server: {
        processingTime,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locale: process.env.LANG || 'en_US'
      },
      dependencies: dependencyStatus,
      endpoints: {
        'GET /api/health': 'Health check endpoint',
        'POST /api/generate-qr': 'QR code generation endpoint',
        'GET /api/generate-qr': 'API documentation endpoint'
      },
      limits: {
        maxRequestSize: '10MB',
        timeout: '30s',
        rateLimit: '100 requests/minute'
      },
      recommendations: generateRecommendations(dependencyStatus)
    };

    return NextResponse.json(responseData, {
      status: httpStatus,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        'X-Processing-Time': processingTime.toString(),
        'X-Health-Status': overallStatus,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now(),
      server: {
        processingTime
      }
    }, {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        'X-Processing-Time': processingTime.toString(),
        'X-Health-Status': 'unhealthy'
      }
    });
  }
}

/**
 * Handle POST request for detailed health check
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `health_detailed_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  try {
    // Parse request body for health check options
    const body = await request.json().catch(() => ({}));
    const { includeMetrics = false, includeLogs = false } = body;

    await logAPIRequest(request, requestId, {
      endpoint: 'health-detailed',
      includeMetrics,
      includeLogs
    });

    // Get basic health data
    const healthData = getHealthData();
    const processingTime = Date.now() - startTime;
    const dependencyStatus = await getDependencyStatus();

    // Build detailed response
    const responseData: any = {
      ...healthData,
      application: {
        name: APP_CONFIG.name,
        version: APP_CONFIG.version,
        description: APP_CONFIG.description,
        environment: process.env.NODE_ENV || 'unknown',
        buildTime: process.env.BUILD_TIME || 'unknown',
        commitHash: process.env.COMMIT_HASH || 'unknown'
      },
      server: {
        processingTime,
        pid: process.pid,
        ppid: process.ppid || 0,
        cwd: process.cwd(),
        execPath: process.execPath,
        argv: process.argv
      },
      system: {
        platform: process.platform,
        architecture: process.arch,
        nodeVersion: process.version,
        cpus: require('os').cpus().length,
        totalMemory: require('os').totalmem(),
        freeMemory: require('os').freemem(),
        loadAverage: require('os').loadavg(),
        hostname: require('os').hostname(),
        userInfo: process.getuid ? {
          uid: process.getuid(),
          gid: process.getgid?.() || 0
        } : null
      },
      dependencies: dependencyStatus,
      features: {
        qrGeneration: await testQRGeneration(),
        fileSystem: testFileSystemAccess(),
        network: true // Always true if we can respond
      },
      troubleshooting: generateTroubleshootingInfo(dependencyStatus)
    };

    // Include performance metrics if requested
    if (includeMetrics) {
      responseData.detailedMetrics = getPerformanceStats();
      responseData.errorDetails = getErrorStats();
    }

    // Include recent logs if requested (be careful with sensitive data)
    if (includeLogs && process.env.NODE_ENV === 'development') {
      // Only include logs in development environment
      responseData.recentActivity = {
        note: 'Log data only available in development',
        requestCount: healthData.performance.totalRequests,
        errorCount: healthData.errors.totalErrors
      };
    }

    const isCriticalError = checkCriticalDependencies(dependencyStatus);
    const overallStatus = isCriticalError ? 'degraded' : healthData.status;
    const httpStatus = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

    return NextResponse.json(responseData, {
      status: httpStatus,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        'X-Processing-Time': processingTime.toString(),
        'X-Health-Status': overallStatus
      }
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Detailed health check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now(),
      server: {
        processingTime
      }
    }, {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        'X-Processing-Time': processingTime.toString(),
        'X-Health-Status': 'unhealthy'
      }
    });
  }
}

/**
 * Handle HEAD request for lightweight health check
 */
export async function HEAD(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `health_head_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  try {
    // Quick health assessment
    const healthData = getHealthData();
    const processingTime = Date.now() - startTime;
    const httpStatus = healthData.status === 'healthy' ? 200 : 503;

    return new NextResponse(null, {
      status: httpStatus,
      headers: {
        'X-Request-ID': requestId,
        'X-Processing-Time': processingTime.toString(),
        'X-Health-Status': healthData.status,
        'X-Uptime': healthData.uptime.toString(),
        'X-Memory-Used': Math.round(healthData.memory.heapUsed / 1024 / 1024).toString() + 'MB',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    return new NextResponse(null, {
      status: 503,
      headers: {
        'X-Request-ID': requestId,
        'X-Health-Status': 'unhealthy'
      }
    });
  }
}

/**
 * Handle OPTIONS request for CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}

/**
 * Test QR generation functionality
 */
async function testQRGeneration(): Promise<boolean> {
  try {
    // Try to require and test QR code generation
    const QRCode = require('qrcode');
    const testData = 'test-health-check';
    await QRCode.toString(testData, { type: 'svg', width: 100 });
    return true;
  } catch (error) {
    console.error('QR generation health check failed:', error);
    return false;
  }
}

/**
 * Test file system access
 */
function testFileSystemAccess(): boolean {
  try {
    // Simple test to ensure we can access file system
    const fs = require('fs');
    
    // Check if we can read the current directory
    const currentDir = process.cwd();
    fs.accessSync(currentDir, fs.constants.R_OK);
    
    return true;
  } catch (error) {
    console.error('File system health check failed:', error);
    return false;
  }
}

/**
 * Get dependency status with detailed error information
 */
async function getDependencyStatus(): Promise<Record<string, any>> {
  try {
    // Read package.json to get dependency versions
    const fs = require('fs');
    const path = require('path');
    
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Test critical dependencies
    const dependencies = {
      next: {
        version: packageJson.dependencies?.next || 'unknown',
        status: 'ok',
        required: true
      },
      qrcode: await testDependencyDetailed('qrcode', packageJson.dependencies?.qrcode),
      canvas: await testDependencyDetailed('canvas', packageJson.dependencies?.canvas),
      react: {
        version: packageJson.dependencies?.react || 'unknown',
        status: 'ok',
        required: true
      }
    };

    return dependencies;
  } catch (error) {
    return {
      error: 'Could not check dependencies',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Test if a dependency can be imported with detailed error info
 */
async function testDependencyDetailed(packageName: string, version?: string): Promise<any> {
  try {
    // Use require instead of dynamic import to avoid webpack warnings
    let module;
    if (packageName === 'qrcode') {
      module = require('qrcode');
    } else if (packageName === 'canvas') {
      module = require('canvas');
    } else {
      module = require(packageName);
    }
    
    return {
      version: version || 'unknown',
      status: 'ok',
      required: packageName === 'qrcode' || packageName === 'canvas'
    };
  } catch (error) {
    return {
      version: version || 'unknown',
      status: 'error',
      required: packageName === 'qrcode' || packageName === 'canvas',
      error: error instanceof Error ? error.message : 'Unknown import error',
      suggestion: getSuggestionForDependency(packageName, error)
    };
  }
}

/**
 * Get installation suggestions for failed dependencies
 */
function getSuggestionForDependency(packageName: string, error: any): string {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  if (packageName === 'canvas') {
    if (errorMessage.includes('node-gyp') || errorMessage.includes('binding')) {
      return 'Canvas requires native dependencies. Try: npm install canvas --build-from-source or use alternative QR generation without Canvas.';
    }
    return `Install Canvas: npm install canvas`;
  }
  
  if (packageName === 'qrcode') {
    return `Install QRCode: npm install qrcode @types/qrcode`;
  }
  
  return `Install ${packageName}: npm install ${packageName}`;
}

/**
 * Check if there are critical dependency errors
 */
function checkCriticalDependencies(dependencies: Record<string, any>): boolean {
  // Check if QR code generation is available - this is essential
  if (dependencies.qrcode && dependencies.qrcode.status === 'error') {
    return true; // Critical error - QR code is essential
  }
  
  // Canvas error is not critical if we can fall back to other methods
  return false;
}

/**
 * Generate recommendations based on dependency status
 */
function generateRecommendations(dependencies: Record<string, any>): string[] {
  const recommendations: string[] = [];
  
  if (dependencies.qrcode && dependencies.qrcode.status === 'error') {
    recommendations.push('Install qrcode package: npm install qrcode @types/qrcode');
  }
  
  if (dependencies.canvas && dependencies.canvas.status === 'error') {
    recommendations.push('For Canvas support: npm install canvas (requires build tools)');
    recommendations.push('Alternative: Use SVG-based QR generation without Canvas');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('All dependencies are working correctly');
  }
  
  return recommendations;
}

/**
 * Generate troubleshooting information
 */
function generateTroubleshootingInfo(dependencies: Record<string, any>): any {
  const troubleshooting = {
    commonIssues: [
      {
        issue: 'Canvas installation fails',
        solution: 'Install build tools: npm install --global windows-build-tools (Windows) or install Xcode (macOS)',
        documentation: 'https://github.com/Automattic/node-canvas#compiling'
      },
      {
        issue: 'QR code generation not working',
        solution: 'Ensure qrcode package is installed: npm install qrcode @types/qrcode',
        documentation: 'https://www.npmjs.com/package/qrcode'
      }
    ] as Array<{
      issue: string;
      solution: string;
      documentation?: string;
      error?: string;
    }>,
    systemRequirements: {
      node: '>=18.0.0',
      npm: '>=8.0.0',
      buildTools: 'Required for Canvas (optional for basic QR generation)'
    },
    fallbackOptions: [
      'Use SVG-based QR generation (no Canvas required)',
      'Use server-side rendering with simplified dependencies',
      'Use external QR generation API as fallback'
    ]
  };

  // Add specific troubleshooting for failed dependencies
  Object.entries(dependencies).forEach(([name, info]: [string, any]) => {
    if (info.status === 'error' && info.suggestion) {
      troubleshooting.commonIssues.unshift({
        issue: `${name} dependency failed`,
        solution: info.suggestion,
        error: info.error
      });
    }
  });

  return troubleshooting;
}