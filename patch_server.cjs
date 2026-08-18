const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Just remove the midtrans initialization and route
code = code.replace(/import midtransClient[\s\S]*?console\.log\(\`Server running on http:\/\/localhost:\$\{PORT\}\`\);\n\}/, 
`
async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(\`Server running on http://localhost:\${PORT}\`);
  });
}`);

fs.writeFileSync('server.ts', code);
