#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { Octokit } from 'octokit';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  throw new Error('GITHUB_TOKEN environment variable is required');
}

class GitHubServer {
  private server: Server;
  private octokit: Octokit;

  constructor() {
    this.server = new Server(
      {
        name: 'github-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.octokit = new Octokit({
      auth: GITHUB_TOKEN,
    });

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'list_repositories',
          description: 'List repositories for the authenticated user',
          inputSchema: {
            type: 'object',
            properties: {
              visibility: {
                type: 'string',
                description: 'Filter by repository visibility (all, public, private)',
                enum: ['all', 'public', 'private'],
              },
              sort: {
                type: 'string',
                description: 'Sort repositories by (created, updated, pushed, full_name)',
                enum: ['created', 'updated', 'pushed', 'full_name'],
              },
              per_page: {
                type: 'number',
                description: 'Number of repositories to return per page (max 100)',
                minimum: 1,
                maximum: 100,
              },
            },
          },
        },
        {
          name: 'get_repository',
          description: 'Get details about a specific repository',
          inputSchema: {
            type: 'object',
            properties: {
              owner: {
                type: 'string',
                description: 'Repository owner',
              },
              repo: {
                type: 'string',
                description: 'Repository name',
              },
            },
            required: ['owner', 'repo'],
          },
        },
        {
          name: 'create_repository',
          description: 'Create a new repository',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Repository name',
              },
              description: {
                type: 'string',
                description: 'Repository description',
              },
              private: {
                type: 'boolean',
                description: 'Whether the repository is private',
              },
              auto_init: {
                type: 'boolean',
                description: 'Whether to create an initial commit with empty README',
              },
              gitignore_template: {
                type: 'string',
                description: 'Gitignore template to use',
              },
              license_template: {
                type: 'string',
                description: 'License template to use',
              },
            },
            required: ['name'],
          },
        },
        {
          name: 'create_issue',
          description: 'Create a new issue in a repository',
          inputSchema: {
            type: 'object',
            properties: {
              owner: {
                type: 'string',
                description: 'Repository owner',
              },
              repo: {
                type: 'string',
                description: 'Repository name',
              },
              title: {
                type: 'string',
                description: 'Issue title',
              },
              body: {
                type: 'string',
                description: 'Issue body',
              },
              labels: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'Labels to add to the issue',
              },
              assignees: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'Usernames to assign to the issue',
              },
            },
            required: ['owner', 'repo', 'title'],
          },
        },
        {
          name: 'list_issues',
          description: 'List issues in a repository',
          inputSchema: {
            type: 'object',
            properties: {
              owner: {
                type: 'string',
                description: 'Repository owner',
              },
              repo: {
                type: 'string',
                description: 'Repository name',
              },
              state: {
                type: 'string',
                description: 'Issue state (open, closed, all)',
                enum: ['open', 'closed', 'all'],
              },
              sort: {
                type: 'string',
                description: 'Sort issues by (created, updated, comments)',
                enum: ['created', 'updated', 'comments'],
              },
              direction: {
                type: 'string',
                description: 'Sort direction (asc, desc)',
                enum: ['asc', 'desc'],
              },
              per_page: {
                type: 'number',
                description: 'Number of issues to return per page (max 100)',
                minimum: 1,
                maximum: 100,
              },
            },
            required: ['owner', 'repo'],
          },
        },
        {
          name: 'get_user',
          description: 'Get information about a GitHub user',
          inputSchema: {
            type: 'object',
            properties: {
              username: {
                type: 'string',
                description: 'GitHub username',
              },
            },
            required: ['username'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'list_repositories': {
            const { visibility, sort, per_page } = request.params.arguments || {};
            const response = await this.octokit.rest.repos.listForAuthenticatedUser({
              visibility,
              sort,
              per_page,
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

          case 'get_repository': {
            const { owner, repo } = request.params.arguments || {};
            if (!owner || !repo) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Owner and repo are required'
              );
            }
            const response = await this.octokit.rest.repos.get({
              owner,
              repo,
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

          case 'create_repository': {
            const { name, description, private: isPrivate, auto_init, gitignore_template, license_template } = 
              request.params.arguments || {};
            if (!name) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Repository name is required'
              );
            }
            const response = await this.octokit.rest.repos.createForAuthenticatedUser({
              name,
              description,
              private: isPrivate,
              auto_init,
              gitignore_template,
              license_template,
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

          case 'create_issue': {
            const { owner, repo, title, body, labels, assignees } = request.params.arguments || {};
            if (!owner || !repo || !title) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Owner, repo, and title are required'
              );
            }
            const response = await this.octokit.rest.issues.create({
              owner,
              repo,
              title,
              body,
              labels,
              assignees,
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

          case 'list_issues': {
            const { owner, repo, state, sort, direction, per_page } = request.params.arguments || {};
            if (!owner || !repo) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Owner and repo are required'
              );
            }
            const response = await this.octokit.rest.issues.listForRepo({
              owner,
              repo,
              state,
              sort,
              direction,
              per_page,
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

          case 'get_user': {
            const { username } = request.params.arguments || {};
            if (!username) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Username is required'
              );
            }
            const response = await this.octokit.rest.users.getByUsername({
              username,
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

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${request.params.name}`
            );
        }
      } catch (error) {
        console.error('Error calling GitHub API:', error);
        return {
          content: [
            {
              type: 'text',
              text: `GitHub API error: ${error instanceof Error ? error.message : String(error)}`,
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
    console.error('GitHub MCP server running on stdio');
  }
}

const server = new GitHubServer();
server.run().catch(console.error);
