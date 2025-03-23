#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, } from '@modelcontextprotocol/sdk/types.js';
import { createClient } from '@supabase/supabase-js';
// Supabase client setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_KEY environment variables are required');
}
// Create the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);
// Type guards for tool arguments
const isGetNotariesArgs = (args) => {
    return typeof args === 'object' && args !== null &&
        (args.limit === undefined || typeof args.limit === 'number') &&
        (args.offset === undefined || typeof args.offset === 'number') &&
        (args.city === undefined || typeof args.city === 'string') &&
        (args.state === undefined || typeof args.state === 'string') &&
        (args.service === undefined || typeof args.service === 'string') &&
        (args.minRating === undefined || typeof args.minRating === 'number');
};
const isGetNotaryArgs = (args) => {
    return typeof args === 'object' && args !== null && typeof args.id === 'string';
};
const isCreateNotaryArgs = (args) => {
    return typeof args === 'object' && args !== null &&
        typeof args.name === 'string' &&
        typeof args.city === 'string' &&
        typeof args.state === 'string' &&
        Array.isArray(args.services) &&
        args.services.every((service) => typeof service === 'string') &&
        (args.rating === undefined || typeof args.rating === 'number') &&
        (args.review_count === undefined || typeof args.review_count === 'number') &&
        (args.profile_image_url === undefined || typeof args.profile_image_url === 'string') &&
        (args.about === undefined || typeof args.about === 'string');
};
const isUpdateNotaryArgs = (args) => {
    return typeof args === 'object' && args !== null &&
        typeof args.id === 'string' &&
        (args.name === undefined || typeof args.name === 'string') &&
        (args.city === undefined || typeof args.city === 'string') &&
        (args.state === undefined || typeof args.state === 'string') &&
        (args.services === undefined || (Array.isArray(args.services) &&
            args.services.every((service) => typeof service === 'string'))) &&
        (args.rating === undefined || typeof args.rating === 'number') &&
        (args.review_count === undefined || typeof args.review_count === 'number') &&
        (args.profile_image_url === undefined || typeof args.profile_image_url === 'string') &&
        (args.about === undefined || typeof args.about === 'string');
};
const isDeleteNotaryArgs = (args) => {
    return typeof args === 'object' && args !== null && typeof args.id === 'string';
};
class SupabaseServer {
    constructor() {
        this.server = new Server({
            name: 'supabase-server',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
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
                    name: 'get_notaries',
                    description: 'Get a list of notaries with optional filtering',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            limit: {
                                type: 'number',
                                description: 'Maximum number of notaries to return',
                            },
                            offset: {
                                type: 'number',
                                description: 'Number of notaries to skip',
                            },
                            city: {
                                type: 'string',
                                description: 'Filter by city',
                            },
                            state: {
                                type: 'string',
                                description: 'Filter by state',
                            },
                            service: {
                                type: 'string',
                                description: 'Filter by service offered',
                            },
                            minRating: {
                                type: 'number',
                                description: 'Filter by minimum rating',
                            },
                        },
                    },
                },
                {
                    name: 'get_notary',
                    description: 'Get a single notary by ID',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            id: {
                                type: 'string',
                                description: 'Notary ID',
                            },
                        },
                        required: ['id'],
                    },
                },
                {
                    name: 'create_notary',
                    description: 'Create a new notary',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string',
                                description: 'Notary name',
                            },
                            city: {
                                type: 'string',
                                description: 'City',
                            },
                            state: {
                                type: 'string',
                                description: 'State',
                            },
                            services: {
                                type: 'array',
                                items: {
                                    type: 'string',
                                },
                                description: 'Services offered',
                            },
                            rating: {
                                type: 'number',
                                description: 'Rating (0-5)',
                            },
                            review_count: {
                                type: 'number',
                                description: 'Number of reviews',
                            },
                            profile_image_url: {
                                type: 'string',
                                description: 'URL to profile image',
                            },
                            about: {
                                type: 'string',
                                description: 'About text',
                            },
                        },
                        required: ['name', 'city', 'state', 'services'],
                    },
                },
                {
                    name: 'update_notary',
                    description: 'Update an existing notary',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            id: {
                                type: 'string',
                                description: 'Notary ID',
                            },
                            name: {
                                type: 'string',
                                description: 'Notary name',
                            },
                            city: {
                                type: 'string',
                                description: 'City',
                            },
                            state: {
                                type: 'string',
                                description: 'State',
                            },
                            services: {
                                type: 'array',
                                items: {
                                    type: 'string',
                                },
                                description: 'Services offered',
                            },
                            rating: {
                                type: 'number',
                                description: 'Rating (0-5)',
                            },
                            review_count: {
                                type: 'number',
                                description: 'Number of reviews',
                            },
                            profile_image_url: {
                                type: 'string',
                                description: 'URL to profile image',
                            },
                            about: {
                                type: 'string',
                                description: 'About text',
                            },
                        },
                        required: ['id'],
                    },
                },
                {
                    name: 'delete_notary',
                    description: 'Delete a notary by ID',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            id: {
                                type: 'string',
                                description: 'Notary ID',
                            },
                        },
                        required: ['id'],
                    },
                },
            ],
        }));
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case 'get_notaries': {
                        if (!isGetNotariesArgs(args)) {
                            throw new McpError(ErrorCode.InvalidParams, 'Invalid arguments for get_notaries');
                        }
                        let query = supabase.from('notaries').select('*');
                        if (args.city) {
                            query = query.eq('city', args.city);
                        }
                        if (args.state) {
                            query = query.eq('state', args.state);
                        }
                        if (args.service) {
                            query = query.contains('services', [args.service]);
                        }
                        if (args.minRating !== undefined) {
                            query = query.gte('rating', args.minRating);
                        }
                        if (args.limit) {
                            query = query.limit(args.limit);
                        }
                        if (args.offset) {
                            query = query.range(args.offset, args.offset + (args.limit || 10) - 1);
                        }
                        const { data, error } = await query;
                        if (error) {
                            throw new McpError(ErrorCode.InternalError, `Supabase error: ${error.message}`);
                        }
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(data, null, 2),
                                },
                            ],
                        };
                    }
                    case 'get_notary': {
                        if (!isGetNotaryArgs(args)) {
                            throw new McpError(ErrorCode.InvalidParams, 'Invalid arguments for get_notary');
                        }
                        const { data, error } = await supabase
                            .from('notaries')
                            .select('*')
                            .eq('id', args.id)
                            .single();
                        if (error) {
                            if (error.code === 'PGRST116') {
                                return {
                                    content: [
                                        {
                                            type: 'text',
                                            text: `Notary with ID ${args.id} not found`,
                                        },
                                    ],
                                    isError: true,
                                };
                            }
                            throw new McpError(ErrorCode.InternalError, `Supabase error: ${error.message}`);
                        }
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(data, null, 2),
                                },
                            ],
                        };
                    }
                    case 'create_notary': {
                        if (!isCreateNotaryArgs(args)) {
                            throw new McpError(ErrorCode.InvalidParams, 'Invalid arguments for create_notary');
                        }
                        const { data, error } = await supabase
                            .from('notaries')
                            .insert({
                            name: args.name,
                            city: args.city,
                            state: args.state,
                            services: args.services,
                            rating: args.rating || 0,
                            review_count: args.review_count || 0,
                            profile_image_url: args.profile_image_url,
                            about: args.about,
                        })
                            .select()
                            .single();
                        if (error) {
                            throw new McpError(ErrorCode.InternalError, `Supabase error: ${error.message}`);
                        }
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(data, null, 2),
                                },
                            ],
                        };
                    }
                    case 'update_notary': {
                        if (!isUpdateNotaryArgs(args)) {
                            throw new McpError(ErrorCode.InvalidParams, 'Invalid arguments for update_notary');
                        }
                        const updateData = {};
                        if (args.name !== undefined)
                            updateData.name = args.name;
                        if (args.city !== undefined)
                            updateData.city = args.city;
                        if (args.state !== undefined)
                            updateData.state = args.state;
                        if (args.services !== undefined)
                            updateData.services = args.services;
                        if (args.rating !== undefined)
                            updateData.rating = args.rating;
                        if (args.review_count !== undefined)
                            updateData.review_count = args.review_count;
                        if (args.profile_image_url !== undefined)
                            updateData.profile_image_url = args.profile_image_url;
                        if (args.about !== undefined)
                            updateData.about = args.about;
                        const { data, error } = await supabase
                            .from('notaries')
                            .update(updateData)
                            .eq('id', args.id)
                            .select()
                            .single();
                        if (error) {
                            throw new McpError(ErrorCode.InternalError, `Supabase error: ${error.message}`);
                        }
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(data, null, 2),
                                },
                            ],
                        };
                    }
                    case 'delete_notary': {
                        if (!isDeleteNotaryArgs(args)) {
                            throw new McpError(ErrorCode.InvalidParams, 'Invalid arguments for delete_notary');
                        }
                        const { error } = await supabase
                            .from('notaries')
                            .delete()
                            .eq('id', args.id);
                        if (error) {
                            throw new McpError(ErrorCode.InternalError, `Supabase error: ${error.message}`);
                        }
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Notary with ID ${args.id} deleted successfully`,
                                },
                            ],
                        };
                    }
                    default:
                        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
                }
            }
            catch (error) {
                if (error instanceof McpError) {
                    throw error;
                }
                console.error('Error in tool handler:', error);
                throw new McpError(ErrorCode.InternalError, `Internal server error: ${error.message}`);
            }
        });
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Supabase MCP server running on stdio');
    }
}
const server = new SupabaseServer();
server.run().catch(console.error);
