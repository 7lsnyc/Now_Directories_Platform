#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
if (!VERCEL_TOKEN) {
    throw new Error('VERCEL_TOKEN environment variable is required');
}
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID; // Optional
class VercelServer {
    constructor() {
        this.server = new Server({
            name: 'vercel-server',
            version: '0.1.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.axiosInstance = axios.create({
            baseURL: 'https://api.vercel.com',
            headers: {
                Authorization: `Bearer ${VERCEL_TOKEN}`,
            },
        });
        this.setupToolHandlers();
        // Error handling
        this.server.onerror = (error) => console.error('[MCP Error]', error);
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'list_projects',
                    description: 'List Vercel projects',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            limit: {
                                type: 'number',
                                description: 'Maximum number of projects to return (max 100)',
                                minimum: 1,
                                maximum: 100,
                            },
                        },
                    },
                },
                {
                    name: 'get_project',
                    description: 'Get details about a specific Vercel project',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            project_id: {
                                type: 'string',
                                description: 'Project ID',
                            },
                        },
                        required: ['project_id'],
                    },
                },
                {
                    name: 'list_deployments',
                    description: 'List deployments for a project',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            project_id: {
                                type: 'string',
                                description: 'Project ID',
                            },
                            limit: {
                                type: 'number',
                                description: 'Maximum number of deployments to return (max 100)',
                                minimum: 1,
                                maximum: 100,
                            },
                        },
                        required: ['project_id'],
                    },
                },
                {
                    name: 'get_deployment',
                    description: 'Get details about a specific deployment',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            deployment_id: {
                                type: 'string',
                                description: 'Deployment ID',
                            },
                        },
                        required: ['deployment_id'],
                    },
                },
                {
                    name: 'get_user',
                    description: 'Get information about the authenticated user',
                    inputSchema: {
                        type: 'object',
                        properties: {},
                    },
                },
            ],
        }));
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            try {
                const teamQuery = VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : '';
                switch (request.params.name) {
                    case 'list_projects': {
                        const { limit } = request.params.arguments || {};
                        const response = await this.axiosInstance.get(`/v9/projects${teamQuery}${limit ? `&limit=${limit}` : ''}`);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(response.data, null, 2),
                                },
                            ],
                        };
                    }
                    case 'get_project': {
                        const { project_id } = request.params.arguments || {};
                        if (!project_id) {
                            throw new McpError(ErrorCode.InvalidParams, 'Project ID is required');
                        }
                        const response = await this.axiosInstance.get(`/v9/projects/${project_id}${teamQuery}`);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(response.data, null, 2),
                                },
                            ],
                        };
                    }
                    case 'list_deployments': {
                        const { project_id, limit } = request.params.arguments || {};
                        if (!project_id) {
                            throw new McpError(ErrorCode.InvalidParams, 'Project ID is required');
                        }
                        const response = await this.axiosInstance.get(`/v6/deployments${teamQuery}`, {
                            params: {
                                projectId: project_id,
                                limit,
                            },
                        });
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(response.data, null, 2),
                                },
                            ],
                        };
                    }
                    case 'get_deployment': {
                        const { deployment_id } = request.params.arguments || {};
                        if (!deployment_id) {
                            throw new McpError(ErrorCode.InvalidParams, 'Deployment ID is required');
                        }
                        const response = await this.axiosInstance.get(`/v13/deployments/${deployment_id}${teamQuery}`);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(response.data, null, 2),
                                },
                            ],
                        };
                    }
                    case 'get_user': {
                        const response = await this.axiosInstance.get('/v2/user');
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(response.data, null, 2),
                                },
                            ],
                        };
                    }
                    default:
                        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
                }
            }
            catch (error) {
                console.error('Error calling Vercel API:', error);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Vercel API error: ${error instanceof Error ? error.message : String(error)}`,
                        },
                    ],
                    isError: true,
                };
            }
        });
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Vercel MCP server running on stdio');
    }
}
const server = new VercelServer();
server.run().catch(console.error);
