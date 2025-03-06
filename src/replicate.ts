import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';
import { URL } from 'url';
interface ResourceOptions {
  isBinary?: boolean;
}

export async function downloadCompleteHTML(url: string): Promise<string> {
  // Helper function to fetch content of external files (CSS, JS, images)
  async function fetchResource(url: string, options: ResourceOptions = {}): Promise<string | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`Failed to fetch resource: ${url} (${response.status})`);
        return null;
      }
      if (options.isBinary) {
        const buffer = await response.buffer();
        return `data:${response.headers.get('content-type') || 'application/octet-stream'};base64,${buffer.toString('base64')}`;
      } else {
        return await response.text();
      }
    } catch (error) {
      console.warn('Failed to fetch resource:', url);
      return null;
    }
  }

  // Helper function to inline external CSS and convert relative URLs to absolute
  async function inlineCSS(linkElement: HTMLLinkElement, baseUrl: string): Promise<HTMLStyleElement | null> {
    try {
      const href = linkElement.getAttribute('href');
      if (!href) return null;

      const absoluteUrl = new URL(href, baseUrl).href;
      const cssContent = await fetchResource(absoluteUrl);
      if (!cssContent) return null;

      // Resolve relative URLs within CSS (for images, fonts, etc.)
      const cssUrlRegex = /url\((?!['"]?(?:data|https?|ftp):)['"]?([^'")]+)['"]?\)/g;
      const resolvedCSS = cssContent.replace(cssUrlRegex, (match, relativeUrl) => {
        try {
          // Remove quotes if they exist
          const cleanUrl = relativeUrl.replace(/['"]/g, '');
          const absoluteResourceUrl = new URL(cleanUrl, absoluteUrl).href;
          return `url("${absoluteResourceUrl}")`;
        } catch (error) {
          console.warn('Failed to resolve URL in CSS:', relativeUrl);
          return match; // Keep the original URL if resolution fails
        }
      });

      // Create a <style> tag with the inlined CSS
      const document = linkElement.ownerDocument;
      if (!document) return null;
      
      const styleElement = document.createElement('style') as HTMLStyleElement;
      styleElement.textContent = resolvedCSS;
      return styleElement;
    } catch (error) {
      console.warn('Failed to inline CSS:', error);
      return null;
    }
  }

  // Helper function to convert images to base64-encoded data URIs
  async function inlineImages(element: Element, baseUrl: string): Promise<void> {
    try {
      const { window } = new JSDOM();
      const images = element.querySelectorAll('img');
      for (const img of Array.from(images)) {
        if (!(img instanceof window.HTMLImageElement)) continue;
        
        const src = img.getAttribute('src');
        if (!src) continue;

        let absoluteUrl: string;
        if (src.startsWith('http')) {
          absoluteUrl = src;
        } else if (!src.startsWith('data:')) {
          absoluteUrl = new URL(src, baseUrl).href;
        } else {
          continue;
        }

        const dataUri = await fetchResource(absoluteUrl, { isBinary: true });
        if (dataUri) {
          img.setAttribute('src', dataUri);
        }
      }
    } catch (error) {
      console.warn('Failed to inline images:', error);
    }
  }

  try {
    // Fetch the initial HTML content
    const htmlContent = await fetchResource(url);

    if (!htmlContent) {
      throw new Error('Failed to fetch HTML content');
    }

    const dom = new JSDOM(htmlContent);
    const { document } = dom.window;

    // Remove all script tags
    // const scripts = document.querySelectorAll('script');
    // scripts.forEach(script => script.remove());

    // Remove inline event handlers from all elements
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      const attributes = Array.from(element.attributes);
      attributes.forEach(attr => {
        if (attr.name.toLowerCase().startsWith('on')) {
          element.removeAttribute(attr.name);
        }
      });
    });

    // Inline all external CSS files
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');

    for (const link of Array.from(stylesheets)) {
      if (!(link instanceof dom.window.HTMLLinkElement)) continue;
      
      const inlineStyleElement = await inlineCSS(link, url);
      if (inlineStyleElement && link.parentNode) {
        link.parentNode.replaceChild(inlineStyleElement, link);
      }
    }

    // Inline all images as base64 data URIs
    // await inlineImages(document.documentElement, url);

    // Get the final HTML including the modified DOM
    const finalHTML = dom.serialize();
    return finalHTML;
  } catch (error) {
    throw error;
  }
}

// Export the function for use in the MCP server
export default downloadCompleteHTML;
