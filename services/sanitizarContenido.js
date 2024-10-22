// services/sanitizerService.js
import sanitizeHtml from 'sanitize-html';

async function sanitizarContenido(html) {
  return sanitizeHtml(html, {
    allowedTags: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'li',
      'ol', 'blockquote', 'code', 'pre', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'figure', 'figcaption', 'br', 'span'
    ],
    allowedAttributes: {
      'a': ['href', 'name', 'target'],
      'img': ['src', 'alt', 'title', 'width', 'height'],
      'span': ['class'],
      '*': ['style']  // Si deseas permitir estilos en línea (pero úsalo con precaución)
    },
    allowedSchemes: ['http', 'https', 'data'],
    allowedSchemesByTag: {
      img: ['http', 'https', 'data']
    }
  });
}

export default { sanitizarContenido }
