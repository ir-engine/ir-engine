const path = require('path');
const express = require('express');
const packageRoot = require('app-root-path').path;

const app = express();
const PORT = process.env.HOST_PORT || 3000;

app.use(express.static(path.join(packageRoot, 'packages', 'client', 'dist')));

app.use('*', (req, res) => res.sendFile(path.join(packageRoot, 'packages', 'client', 'dist', 'index.html')));

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
