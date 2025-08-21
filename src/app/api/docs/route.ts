// src/app/api/docs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { QRMode, OutputFormat, ErrorCorrectionLevel } from '@/types/qr-types';

// Configure route segment options
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 10;

/**
 * Handle GET request for API documentation
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'html'; // Default to HTML

  try {
    const apiDocs = {
      title: "QR Generator API Documentation",
      version: "1.0.0",
      description: "Professional QR Code Generator API with multiple formats and customization options",
      baseUrl: getBaseUrl(request),
      
      // API Endpoints
      endpoints: {
        "POST /api/generate-qr": {
          description: "Generate QR Code",
          summary: "Create QR codes with various customization options",
          parameters: {
            data: {
              type: "string",
              required: true,
              description: "Data to encode in QR code",
              example: "https://example.com"
            },
            mode: {
              type: "string",
              enum: Object.values(QRMode),
              default: QRMode.BASIC,
              description: "QR generation mode",
              examples: {
                [QRMode.BASIC]: "Standard black and white QR code",
                [QRMode.COLORED]: "Custom colored QR code",
                [QRMode.SVG]: "Vector-based QR code",
                [QRMode.HIGH_QUALITY]: "High-quality QR code with maximum error correction"
              }
            },
            options: {
              type: "object",
              description: "Optional configuration parameters",
              properties: {
                width: {
                  type: "number",
                  default: 256,
                  min: 64,
                  max: 2048,
                  description: "QR code width in pixels"
                },
                height: {
                  type: "number", 
                  default: 256,
                  min: 64,
                  max: 2048,
                  description: "QR code height in pixels"
                },
                margin: {
                  type: "number",
                  default: 4,
                  min: 0,
                  max: 20,
                  description: "Quiet zone margin around QR code"
                },
                color: {
                  type: "object",
                  description: "Color customization (for colored mode)",
                  properties: {
                    dark: {
                      type: "string",
                      default: "#000000",
                      description: "Foreground/pattern color (hex format)",
                      pattern: "^#[0-9A-Fa-f]{6}$"
                    },
                    light: {
                      type: "string",
                      default: "#ffffff",
                      description: "Background color (hex format)",
                      pattern: "^#[0-9A-Fa-f]{6}$"
                    }
                  }
                },
                errorCorrectionLevel: {
                  type: "string",
                  enum: Object.values(ErrorCorrectionLevel),
                  default: ErrorCorrectionLevel.MEDIUM,
                  description: "Error correction level",
                  examples: {
                    [ErrorCorrectionLevel.LOW]: "~7% error correction - Maximum data capacity",
                    [ErrorCorrectionLevel.MEDIUM]: "~15% error correction - Balanced option",
                    [ErrorCorrectionLevel.QUARTILE]: "~25% error correction - Good for print",
                    [ErrorCorrectionLevel.HIGH]: "~30% error correction - Maximum durability"
                  }
                },
                quality: {
                  type: "number",
                  default: 0.92,
                  min: 0.1,
                  max: 1.0,
                  description: "Image quality for JPEG output"
                }
              }
            },
            filename: {
              type: "string",
              optional: true,
              description: "Custom filename for the generated QR code",
              example: "my-qr-code.png"
            }
          }
        },

        "GET /api/generate-qr": {
          description: "Get API Information",
          summary: "Retrieve basic API information and supported options"
        },

        "GET /api/health": {
          description: "Health Check",
          summary: "Check API service health and get system information"
        }
      },

      // Data Types
      dataTypes: {
        TEXT: {
          description: "Plain text content",
          example: "Hello World!",
          maxLength: 4296
        },
        URL: {
          description: "Website URLs",
          example: "https://example.com",
          validation: "Must start with http:// or https://"
        },
        EMAIL: {
          description: "Email addresses with optional subject and body",
          examples: [
            "hello@example.com",
            "mailto:hello@example.com",
            "mailto:hello@example.com?subject=Hello&body=Message"
          ]
        },
        PHONE: {
          description: "Phone numbers for one-tap calling",
          examples: [
            "+1234567890",
            "tel:+1234567890"
          ]
        },
        SMS: {
          description: "SMS messages with recipient",
          examples: [
            "sms:+1234567890",
            "sms:+1234567890:Hello from QR code!"
          ]
        },
        WIFI: {
          description: "WiFi network credentials",
          format: "WIFI:T:[WPA|WEP|nopass];S:[network name];P:[password];H:[hidden];;",
          examples: [
            "WIFI:T:WPA;S:MyNetwork;P:MyPassword;;",
            "WIFI:T:WPA;S:MyNetwork;P:MyPassword;H:true;;"
          ]
        }
      },

      // Output Formats
      outputFormats: {
        PNG: {
          description: "Portable Network Graphics - Best for web use",
          mimeType: "image/png",
          features: ["Transparency", "Lossless compression", "Wide compatibility"]
        },
        SVG: {
          description: "Scalable Vector Graphics - Perfect for print",
          mimeType: "image/svg+xml",
          features: ["Infinite scalability", "Small file size", "Editable"]
        },
        JPEG: {
          description: "Joint Photographic Experts Group - Smallest file size",
          mimeType: "image/jpeg",
          features: ["High compression", "Universal compatibility"],
          limitations: ["No transparency", "Lossy compression"]
        },
        WEBP: {
          description: "WebP - Modern web format",
          mimeType: "image/webp",
          features: ["Best compression", "Transparency support", "Modern browsers"]
        }
      },

      // Code Examples
      examples: {
        javascript: `// Basic QR code generation
const response = await fetch('/api/generate-qr', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: 'https://example.com',
    mode: 'basic'
  })
});

const result = await response.json();
if (result.success) {
  document.getElementById('qr-image').src = result.data;
}`,

        curl: `# Basic QR code generation
curl -X POST ${getBaseUrl(request)}/api/generate-qr \\
  -H "Content-Type: application/json" \\
  -d '{
    "data": "https://example.com",
    "mode": "basic"
  }'`,

        python: `import requests

# Generate QR code
response = requests.post('${getBaseUrl(request)}/api/generate-qr', json={
    'data': 'https://example.com',
    'mode': 'basic'
})

if response.status_code == 200:
    result = response.json()
    print("QR generated:", result['data']['filename'])`
      },

      // Meta
      meta: {
        lastUpdated: new Date().toISOString(),
        documentation: `${getBaseUrl(request)}/api/docs`,
        version: "1.0.0"
      }
    };

    // Return JSON if specifically requested
    if (format === 'json') {
      return NextResponse.json(apiDocs, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    }

    // Default to HTML
    return new NextResponse(generateModernHTMLDocs(apiDocs), {
      headers: { 
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'DOCS_ERROR',
        message: 'Failed to generate documentation',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}

/**
 * Get base URL from request
 */
function getBaseUrl(request: NextRequest): string {
  const protocol = request.headers.get('x-forwarded-proto') || 
                  (request.url.startsWith('https') ? 'https' : 'http');
  const host = request.headers.get('host') || 'localhost:3000';
  return `${protocol}://${host}`;
}

/**
 * Generate modern HTML documentation
 */
function generateModernHTMLDocs(docs: any): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${docs.title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: white;
            min-height: 100vh;
            box-shadow: 0 0 50px rgba(0,0,0,0.1);
        }
        
        .header {
            text-align: center;
            padding: 40px 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            margin: -20px -20px 40px;
            border-radius: 0 0 20px 20px;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 700;
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .badge {
            display: inline-block;
            padding: 4px 12px;
            background: rgba(255,255,255,0.2);
            border-radius: 20px;
            font-size: 0.9rem;
            margin: 10px 0;
        }
        
        .nav {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 30px;
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            justify-content: center;
        }
        
        .nav a {
            text-decoration: none;
            color: #667eea;
            padding: 8px 16px;
            border-radius: 5px;
            border: 2px solid #667eea;
            transition: all 0.3s ease;
            font-weight: 500;
        }
        
        .nav a:hover {
            background: #667eea;
            color: white;
            transform: translateY(-2px);
        }
        
        .section {
            margin-bottom: 50px;
            padding: 30px;
            background: #f8f9fa;
            border-radius: 15px;
            border-left: 5px solid #667eea;
        }
        
        .section h2 {
            font-size: 2rem;
            margin-bottom: 20px;
            color: #333;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .section h2::before {
            content: '';
            width: 30px;
            height: 4px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 2px;
        }
        
        .endpoint {
            background: white;
            padding: 25px;
            border-radius: 10px;
            margin-bottom: 20px;
            border: 1px solid #e9ecef;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        
        .method {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 6px;
            font-weight: bold;
            font-size: 0.85rem;
            margin-right: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .post { background: #28a745; color: white; }
        .get { background: #007bff; color: white; }
        .put { background: #ffc107; color: #212529; }
        .delete { background: #dc3545; color: white; }
        
        .endpoint-path {
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 1.1rem;
            font-weight: 600;
            color: #495057;
        }
        
        .endpoint-desc {
            margin-top: 10px;
            color: #6c757d;
        }
        
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .card {
            background: white;
            border: 1px solid #e9ecef;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        
        .card h3 {
            color: #667eea;
            margin-bottom: 10px;
            font-size: 1.2rem;
        }
        
        .card p {
            color: #6c757d;
            margin-bottom: 10px;
        }
        
        pre {
            background: #2d3748;
            color: #e2e8f0;
            padding: 20px;
            border-radius: 10px;
            overflow-x: auto;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.9rem;
            line-height: 1.5;
            margin: 15px 0;
            border: 1px solid #4a5568;
        }
        
        code {
            background: #f1f3f4;
            padding: 3px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.85rem;
            color: #e83e8c;
        }
        
        .example-tabs {
            display: flex;
            margin-bottom: 10px;
            border-bottom: 2px solid #e9ecef;
        }
        
        .tab {
            padding: 10px 20px;
            background: #f8f9fa;
            border: none;
            cursor: pointer;
            border-radius: 5px 5px 0 0;
            margin-right: 5px;
            transition: all 0.3s ease;
        }
        
        .tab.active {
            background: #667eea;
            color: white;
        }
        
        .tab-content {
            display: none;
        }
        
        .tab-content.active {
            display: block;
        }
        
        .quick-links {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            z-index: 1000;
        }
        
        .quick-links a {
            display: block;
            color: #667eea;
            text-decoration: none;
            margin: 5px 0;
            padding: 5px 10px;
            border-radius: 5px;
            transition: background 0.3s ease;
        }
        
        .quick-links a:hover {
            background: #f8f9fa;
        }
        
        .footer {
            text-align: center;
            padding: 40px 0;
            color: #6c757d;
            border-top: 1px solid #e9ecef;
            margin-top: 50px;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .section {
                padding: 20px;
            }
            
            .quick-links {
                position: static;
                margin-bottom: 20px;
            }
            
            .nav {
                flex-direction: column;
                align-items: center;
            }
        }
        
        /* JSON Syntax Highlighting */
        .json-key { color: #0451a5; }
        .json-string { color: #a31515; }
        .json-number { color: #098658; }
        .json-boolean { color: #0000ff; }
        .json-null { color: #795e26; }
    </style>
</head>
<body>
    <div class="container">
        <div class="quick-links">
            <a href="#endpoints">API Endpoints</a>
            <a href="#data-types">Data Types</a>
            <a href="#formats">Output Formats</a>
            <a href="#examples">Code Examples</a>
            <a href="?format=json">View as JSON</a>
        </div>
        
        <div class="header">
            <h1>${docs.title}</h1>
            <p>${docs.description}</p>
            <div class="badge">Version ${docs.version}</div>
            <div class="badge">Base URL: ${docs.baseUrl}</div>
        </div>
        
        <div class="nav">
            <a href="${docs.baseUrl}">🏠 Home</a>
            <a href="${docs.baseUrl}/api/health">🏥 Health Check</a>
            <a href="${docs.baseUrl}/api/generate-qr">📡 API Info</a>
            <a href="#quick-start">🚀 Quick Start</a>
        </div>
        
        <div id="quick-start" class="section">
            <h2>🚀 Quick Start</h2>
            <p>Generate a QR code with a simple POST request:</p>
            <pre><code>curl -X POST ${docs.baseUrl}/api/generate-qr \\
  -H "Content-Type: application/json" \\
  -d '{
    "data": "https://example.com",
    "mode": "basic"
  }'</code></pre>
        </div>
        
        <div id="endpoints" class="section">
            <h2>📡 API Endpoints</h2>
            ${Object.entries(docs.endpoints).map(([endpoint, info]: [string, any]) => {
                const [method, path] = endpoint.split(' ');
                const methodClass = method.toLowerCase();
                return `
                    <div class="endpoint">
                        <div>
                            <span class="method ${methodClass}">${method}</span>
                            <span class="endpoint-path">${path}</span>
                        </div>
                        <div class="endpoint-desc">
                            <strong>${info.description}</strong><br>
                            ${info.summary || ''}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        
        <div id="data-types" class="section">
            <h2>📝 Supported Data Types</h2>
            <div class="grid">
                ${Object.entries(docs.dataTypes).map(([type, info]: [string, any]) => `
                    <div class="card">
                        <h3>${type}</h3>
                        <p>${info.description}</p>
                        <code>${Array.isArray(info.examples) ? info.examples[0] : info.example}</code>
                        ${info.maxLength ? `<p><small>Max length: ${info.maxLength} characters</small></p>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div id="formats" class="section">
            <h2>🎨 Output Formats</h2>
            <div class="grid">
                ${Object.entries(docs.outputFormats).map(([format, info]: [string, any]) => `
                    <div class="card">
                        <h3>${format}</h3>
                        <p>${info.description}</p>
                        <p><strong>MIME Type:</strong> <code>${info.mimeType}</code></p>
                        <p><strong>Features:</strong> ${info.features.join(', ')}</p>
                        ${info.limitations ? `<p><strong>Limitations:</strong> ${info.limitations.join(', ')}</p>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div id="examples" class="section">
            <h2>💻 Code Examples</h2>
            
            <div class="example-tabs">
                <button class="tab active" onclick="switchTab(event, 'javascript')">JavaScript</button>
                <button class="tab" onclick="switchTab(event, 'curl')">cURL</button>
                <button class="tab" onclick="switchTab(event, 'python')">Python</button>
            </div>
            
            <div id="javascript" class="tab-content active">
                <pre><code>${docs.examples.javascript}</code></pre>
            </div>
            
            <div id="curl" class="tab-content">
                <pre><code>${docs.examples.curl}</code></pre>
            </div>
            
            <div id="python" class="tab-content">
                <pre><code>${docs.examples.python}</code></pre>
            </div>
        </div>
        
        <div class="section">
            <h2>⚡ Live API Tester</h2>
            <div class="card">
                <h3>Test POST /api/generate-qr</h3>
                <div style="margin: 20px 0;">
                    <label>Data to encode:</label><br>
                    <input type="text" id="testData" value="https://example.com" style="width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 5px;">
                </div>
                <div style="margin: 20px 0;">
                    <label>Mode:</label><br>
                    <select id="testMode" style="width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 5px;">
                        <option value="basic">Basic</option>
                        <option value="colored">Colored</option>
                        <option value="svg">SVG</option>
                        <option value="hq">High Quality</option>
                    </select>
                </div>
                <button onclick="testAPI()" style="background: #667eea; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer; font-size: 1rem;">
                    🧪 Test API
                </button>
                <div id="testResult" style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px; display: none;">
                    <h4>Result:</h4>
                    <pre id="testOutput"></pre>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString()}</p>
            <p>Last updated: ${docs.meta.lastUpdated}</p>
            <p><a href="?format=json" style="color: #667eea;">View Raw JSON</a></p>
        </div>
    </div>
    
    <script>
        function switchTab(evt, tabName) {
            var i, tabcontent, tabs;
            tabcontent = document.getElementsByClassName("tab-content");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].classList.remove("active");
            }
            tabs = document.getElementsByClassName("tab");
            for (i = 0; i < tabs.length; i++) {
                tabs[i].classList.remove("active");
            }
            document.getElementById(tabName).classList.add("active");
            evt.currentTarget.classList.add("active");
        }
        
        async function testAPI() {
            const data = document.getElementById('testData').value;
            const mode = document.getElementById('testMode').value;
            const resultDiv = document.getElementById('testResult');
            const outputPre = document.getElementById('testOutput');
            
            try {
                const response = await fetch('/api/generate-qr', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data, mode })
                });
                
                const result = await response.json();
                outputPre.textContent = JSON.stringify(result, null, 2);
                resultDiv.style.display = 'block';
                
                // Scroll to result
                resultDiv.scrollIntoView({ behavior: 'smooth' });
            } catch (error) {
                outputPre.textContent = 'Error: ' + error.message;
                resultDiv.style.display = 'block';
            }
        }
        
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    </script>
</body>
</html>`;
}