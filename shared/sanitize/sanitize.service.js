import sanitizeHtml from 'sanitize-html';

export async function sanitizarContenido(html) {
    return sanitizeHtml(html, {
        allowedTags: [
            'b', 'i', 'em', 'strong', 'a', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'li',
            'ol', 'blockquote', 'code', 'pre', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
            'figure', 'figcaption', 'br', 'span'
        ],
        allowedAttributes: {
            'a': ['href', 'name', 'target'],
            'img': ['src', 'alt', 'title', 'width', 'height']
        },
        allowedSchemes: ['http', 'https'],
        allowedSchemesByTag: {
            img: ['http', 'https']
        }
    });
}
