# QR Generator Web App

A modern, professional QR code generator built with Next.js 14, TypeScript, and Tailwind CSS. Generate high-quality QR codes for URLs, text, emails, phone numbers, SMS, and WiFi credentials with custom colors and multiple export formats.

![QR Generator Preview](public/images/preview.png)

## 🚀 Features

### Core Functionality
- **Multiple Data Types**: URLs, plain text, email, phone, SMS, WiFi
- **4 Generation Modes**: Basic, Colored, SVG, High Quality
- **Multiple Formats**: PNG, SVG, JPG, WebP with high-quality output
- **Custom Colors**: Brand color matching with contrast validation
- **Error Correction**: Adjustable levels for different use cases
- **Real-time Preview**: Instant QR code generation with live updates

### User Experience
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Privacy Focused**: All processing happens locally - no data sent to servers
- **Fast & Reliable**: Optimized for performance with error handling
- **Accessibility**: Screen reader support and keyboard navigation
- **Progressive Web App**: Installable with offline capabilities

### Advanced Features
- **Batch Generation**: Create multiple QR codes at once
- **Analytics Tracking**: Usage analytics with privacy compliance
- **Error Recovery**: Comprehensive error handling with retry mechanisms
- **Performance Monitoring**: Built-in performance tracking
- **User Guide**: Complete in-app documentation

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **QR Generation**: QRCode.js library
- **Canvas Processing**: HTML5 Canvas API
- **File Handling**: File-saver for downloads
- **Deployment**: Vercel (optimized)

## 📦 Installation

### Prerequisites
- Node.js 18.0 or higher
- npm or yarn package manager

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/Ikrar06/qr-generator-web.git
cd qr-generator-web
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

4. **Run the development server**
```bash
npm run dev
# or
yarn dev
```

5. **Open your browser**
Visit [http://localhost:3000](http://localhost:3000)

### Production Build
```bash
npm run build
npm start
```

## 📁 Project Structure

```
qr-generator-web/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── components/         # React components
│   │   │   ├── ui/            # Reusable UI components
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── UserGuide.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── api/               # API routes
│   │   │   ├── generate-qr/
│   │   │   ├── health/
│   │   │   └── analytics/
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # Shared components
│   ├── lib/                   # Utilities and core logic
│   │   ├── qr-generator.ts    # QR generation logic
│   │   ├── error-handling.ts  # Error management
│   │   ├── analytics.ts       # Analytics tracking
│   │   └── utils.ts           # Helper functions
│   ├── hooks/                 # React hooks
│   │   └── useQRGenerator.ts  # QR generation hook
│   └── types/                 # TypeScript definitions
│       └── qr-types.ts        # QR-related types
├── public/                    # Static assets
├── docs/                      # Documentation
├── generated-qr/              # Generated QR codes
└── downloads/                 # Download cache
```

## 🎯 Usage

### Basic QR Generation

1. **Select Data Type**: Choose from URL, Text, Email, Phone, SMS, or WiFi
2. **Enter Content**: Input your data in the text field
3. **Choose Mode**: Select Basic, Colored, SVG, or High Quality
4. **Customize**: Adjust colors, size, and error correction
5. **Generate**: Click "Generate QR Code"
6. **Download**: Choose your preferred format and download

### Advanced Options

#### Error Correction Levels
- **Low (7%)**: Maximum data capacity
- **Medium (15%)**: Balanced option (recommended)
- **Quartile (25%)**: Good for print materials
- **High (30%)**: Maximum damage resistance

#### Generation Modes
- **Basic**: Standard black and white QR codes
- **Colored**: Custom foreground and background colors
- **SVG**: Vector format for infinite scalability
- **High Quality**: Professional grade with maximum error correction

#### Output Formats
- **PNG**: Best for web use with transparency support
- **SVG**: Perfect for print and scalable graphics
- **JPG**: Smallest file size for quick sharing
- **WebP**: Modern format with superior compression

## 🔧 Configuration

### Environment Variables

```env
# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_ANALYTICS_CONSENT=false

# Error Reporting (optional)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

# Performance Monitoring
NEXT_PUBLIC_PERFORMANCE_MONITORING=true
```

### Customization

#### Colors and Theming
Edit `tailwind.config.js` to customize the color palette:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          // ... more colors
        }
      }
    }
  }
}
```

#### QR Generator Settings
Modify `src/lib/constants.ts` for default settings:

```typescript
export const QR_DEFAULTS = {
  width: 256,
  height: 256,
  margin: 2,
  errorCorrectionLevel: 'M',
  quality: 0.92
};
```

## 📊 Analytics & Monitoring

### Built-in Analytics
- QR generation tracking
- Error monitoring
- Performance metrics
- User interaction analytics
- GDPR-compliant data collection

### Performance Monitoring
- Page load times
- Generation performance
- Download success rates
- Error rates and categorization

### Privacy Features
- Local processing only
- No data collection without consent
- GDPR compliance
- Do Not Track respect

## 🔒 Security

### Data Privacy
- **Local Processing**: All QR generation happens in the browser
- **No Server Storage**: No user data stored on servers
- **HTTPS Only**: Secure connections in production
- **Content Validation**: Input sanitization and validation

### Security Best Practices
- Input validation and sanitization
- XSS protection
- CSRF protection
- Secure headers configuration
- Regular dependency updates

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**
```bash
vercel
```

2. **Configure Environment**
Set environment variables in Vercel dashboard

3. **Deploy**
```bash
vercel --prod
```

### Docker

1. **Build Image**
```bash
docker build -t qr-generator-web .
```

2. **Run Container**
```bash
docker run -p 3000:3000 qr-generator-web
```

### Static Export
```bash
npm run build
npm run export
```

## 🧪 Testing

### Running Tests
```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Browser Testing
Test on multiple browsers and devices:
- Chrome/Edge (Chromium-based)
- Firefox
- Safari (WebKit)
- Mobile browsers (iOS Safari, Android Chrome)

## 🐛 Troubleshooting

### Common Issues

#### QR Code Won't Scan
- Check color contrast (minimum 4.5:1 ratio)
- Increase QR code size
- Use higher error correction level
- Ensure adequate quiet space

#### Download Fails
- Check browser permissions
- Try different format (PNG vs SVG)
- Clear browser cache
- Disable ad blockers temporarily

#### Performance Issues
- Reduce QR code size
- Use Basic mode instead of High Quality
- Close other browser tabs
- Update browser to latest version

### Debug Mode
Enable debug logging:
```javascript
localStorage.setItem('qr_debug', 'true');
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run the test suite
6. Submit a pull request

### Code Standards
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Conventional commits
- Component testing

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [QRCode.js](https://github.com/soldair/node-qrcode) for QR generation
- [Next.js](https://nextjs.org/) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Vercel](https://vercel.com/) for hosting and deployment
- The open-source community for inspiration and tools

## 📞 Support

### Getting Help
- 📚 [Documentation](docs/)
- 💬 [Discussions](https://github.com/Ikrar06/qr-generator-web/discussions)
- 🐛 [Issue Tracker](https://github.com/Ikrar06/qr-generator-web/issues)
- ✉️ [Email Support](mailto:support@qrgenerator.com)

### Reporting Issues
When reporting issues, please include:
- Browser and version
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Console error messages

### Feature Requests
We love hearing about new feature ideas! Please check existing issues first and provide:
- Clear use case description
- Expected behavior
- Any relevant examples or mockups

## 🔄 Changelog

### Version 1.0.0 (Current)
- Initial release with core QR generation
- Multiple data type support
- Custom color options
- Real-time preview
- Multiple output formats
- Error handling and recovery
- Analytics and performance monitoring
- Comprehensive user guide
- PWA capabilities

### Upcoming Features
- QR code templates and presets
- Batch processing improvements
- Advanced customization options
- Integration APIs
- Enhanced accessibility features


## 📈 Performance

### Benchmarks
- **Generation Time**: < 100ms for standard QR codes
- **File Sizes**: 
  - PNG: 2-10KB typical
  - SVG: 1-5KB typical
  - WebP: 1-8KB typical
- **Browser Support**: 95%+ modern browsers
- **Mobile Performance**: Optimized for all devices

### Optimization Features
- Lazy loading for non-critical components
- Image optimization and compression
- Code splitting for faster initial loads
- Service worker for offline functionality
- Progressive enhancement

## 🌐 Browser Support

| Browser | Version | Support Level |
|---------|---------|---------------|
| Chrome  | 88+     | Full          |
| Firefox | 85+     | Full          |
| Safari  | 14+     | Full          |
| Edge    | 88+     | Full          |
| iOS Safari | 14+ | Full          |
| Android Chrome | 88+ | Full |
| IE      | Not supported | - |

### Feature Detection
The app includes progressive enhancement:
- Core functionality works in all supported browsers
- Advanced features degrade gracefully
- Polyfills included for older browser support

## 🔧 API Reference

### QR Generation Hook

```typescript
const {
  generate,
  download,
  state,
  progress,
  clear
} = useQRGenerator();
```

#### Methods

##### generate(request: QRGenerationRequest)
Generate a QR code with specified options.

```typescript
const result = await generate({
  data: 'https://example.com',
  mode: QRMode.COLORED,
  options: {
    width: 256,
    height: 256,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  }
});
```

##### download(response: QRGenerationResponse, options?: DownloadOptions)
Download generated QR code in specified format.

```typescript
await download(response, {
  format: OutputFormat.PNG,
  filename: 'my-qr-code.png'
});
```

### Error Handling

```typescript
import { handleError } from '@/lib/error-handling';

try {
  // Your code here
} catch (error) {
  const processedError = await handleError(error, {
    component: 'QRGenerator',
    function: 'generate'
  });
}
```

### Analytics Tracking

```typescript
import { trackQRGeneration } from '@/lib/analytics';

trackQRGeneration({
  mode: 'colored',
  dataType: 'url',
  format: 'png',
  success: true
});
```

## 🎨 Customization Guide

### Theme Customization
Modify the default theme in `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#your-color',
          secondary: '#your-color'
        }
      },
      fontFamily: {
        sans: ['Your Font', 'system-ui']
      }
    }
  }
}
```

### Component Customization
Override default component styles:

```css
/* In your custom CSS file */
.qr-generator-container {
  @apply your-custom-classes;
}
```

### Adding Custom Data Types
Extend the QR generator with custom data types:

```typescript
// In src/types/qr-types.ts
export enum QRDataType {
  // ... existing types
  CUSTOM = 'custom'
}

// Add validation logic in src/lib/validation.ts
// Add formatting logic in src/lib/qr-generator.ts
```

## 📱 Mobile Optimization

### Features
- Touch-optimized interfaces
- Responsive design for all screen sizes
- Optimized file sizes for mobile networks
- Offline functionality with service workers
- Native app-like experience

### PWA Installation
Users can install the app on mobile devices:
1. Visit the website in a mobile browser
2. Tap "Add to Home Screen" when prompted
3. Access the app like a native application

## 🔐 Security Considerations

### Input Validation
All user inputs are validated and sanitized:
- URL format validation
- Email format checking
- Phone number validation
- Text length limits
- Character encoding validation

### Content Security Policy
The app implements strict CSP headers:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'
```

### Data Privacy
- No user data stored on servers
- Local storage only for user preferences
- Analytics data anonymized
- GDPR compliance built-in

## 🧪 Testing Strategy

### Test Coverage
- Unit tests for utility functions
- Integration tests for QR generation
- Component tests for UI elements
- E2E tests for user workflows
- Performance tests for optimization

### Continuous Integration
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run build
```

## 📊 Monitoring and Analytics

### Built-in Metrics
- QR generation success rates
- Popular data types and formats
- User interaction patterns
- Performance bottlenecks
- Error rates and types

### Privacy-First Analytics
- No personal data collection
- Opt-in analytics only
- Anonymized metrics
- GDPR compliant
- Local data processing


## 🤖 Automation

### GitHub Actions
- Automated testing on PR
- Dependency updates
- Security scanning
- Performance monitoring
- Automated releases

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  }
}
```



---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.

For more information, visit our [website](https://qrgenerator.com) or check out the [live demo](https://qr-generator-web-iota.vercel.app/).