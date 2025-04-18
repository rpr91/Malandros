# Image Optimization Guide

## Optimization Strategy

1. **File Formats**:
   - Prefer WebP format for photographic images (75-85% quality)
   - Use PNG for graphics with transparency
   - SVG for logos and icons

2. **Responsive Images**:
   - Each image has multiple versions for different screen sizes
   - Served via `srcset` with density descriptors (1x, 2x)
   - Proper `sizes` attributes for layout-appropriate loading

3. **Lazy Loading**:
   - All images use native `loading="lazy"`
   - Critical images marked with `loading="eager"`

## Implementation

1. **Image Processing**:
   - Images are processed during build
   - Multiple versions generated (WebP + fallbacks)
   - Optimized for quality/size balance

2. **Component Usage**:
```tsx
// Basic usage
<OptimizedImage 
  src="/path/to/image.jpg"
  alt="Description"
  width={800}
  height={600}
/>

// With responsive variants
<OptimizedImage
  src="/path/to/image.jpg"
  alt="Description"
  srcSet="image-400.jpg 400w, image-800.jpg 800w"
  sizes="(max-width: 600px) 100vw, 50vw"
/>
```

## Future Improvements

- Implement blur-up/LQIP techniques
- Add automatic CDN integration
- Support AVIF format where supported