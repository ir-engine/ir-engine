const path = require('path');
const express = require('express');
const packageRoot = require('app-root-path').path;

const app = express();
const PORT = process.env.HOST_PORT || 3000;

const distPath = process.env.BUILD_MODE === 'individual' ? path.join(packageRoot, 'dist') : path.join(packageRoot, 'packages', 'client', 'dist');

app.use(express.static(distPath));

app.use('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
