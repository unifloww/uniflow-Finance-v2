const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(
  '<meta name="theme-color" content="#059669" />',
  `<meta name="theme-color" content="#059669" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="UniFlow" />`
);

fs.writeFileSync('index.html', html);
