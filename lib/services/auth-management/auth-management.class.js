"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Authmanagement {
    constructor(options = {}, app) {
        this.options = options;
        this.app = app;
    }
    async find(params) {
        return [];
    }
    async get(id, params) {
        return {
            id, text: `A new message with ID: ${id}!`
        };
    }
    async create(data, params) {
        if (Array.isArray(data)) {
            return await Promise.all(data.map(current => this.create(current, params)));
        }
        return data;
    }
    async update(id, data, params) {
        return data;
    }
    async patch(id, data, params) {
        return data;
    }
    async remove(id, params) {
        return { id };
    }
}
exports.Authmanagement = Authmanagement;
