"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("./logger"));
const app_1 = __importDefault(require("./app"));
const port = app_1.default.get('port');
const server = app_1.default.listen(port);
process.on('unhandledRejection', (reason, p) => logger_1.default.error('Unhandled Rejection at: Promise ', p, reason));
server.on('listening', () => logger_1.default.info('Feathers application started on http://%s:%d', app_1.default.get('host'), port));
