interface ErrorPageOptions {
  code: string
  title: string
  message: string
  resource?: string
}

const errorPageStyles = `
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: #f5f5f5;
    color: #333;
  }
  .container {
    text-align: center;
    padding: 2rem;
    max-width: 600px;
  }
  h1 {
    font-size: 6rem;
    margin: 0;
    color: #999;
  }
  h2 {
    font-size: 1.5rem;
    margin: 1rem 0;
    font-weight: 500;
  }
  .resource {
    background: #fff;
    padding: 0.75rem 1rem;
    border-radius: 4px;
    border: 1px solid #ddd;
    font-family: monospace;
    word-break: break-all;
    margin: 1.5rem 0;
  }
  p {
    color: #666;
    line-height: 1.6;
  }
`

function createErrorPage(options: ErrorPageOptions): string {
  const { code, title, message, resource } = options

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${code} - ${title}</title>
  <style>${errorPageStyles}</style>
</head>
<body>
  <div class="container">
    <h1>${code}</h1>
    <h2>${title}</h2>
    ${resource ? `<div class="resource">${resource}</div>` : ''}
    <p>${message}</p>
  </div>
</body>
</html>`
}

export function FourOFour(path: string): string {
  return createErrorPage({
    code: '404',
    title: 'File Not Found',
    message: 'The requested file could not be found in this REPL.',
    resource: path || '/',
  })
}

export function InternalServerError(message?: string): string {
  return createErrorPage({
    code: '500',
    title: 'Internal Server Error',
    message:
      message || 'An unexpected error occurred while processing your request.',
  })
}

export function BadRequest(message?: string): string {
  return createErrorPage({
    code: '400',
    title: 'Bad Request',
    message: message || 'The request could not be understood by the server.',
  })
}
