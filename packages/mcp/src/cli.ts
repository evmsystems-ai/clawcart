#!/usr/bin/env node

/**
 * ClawCart MCP CLI
 * 
 * Run as: npx @clawcart/mcp
 */

import { MCP_TOOLS, handleToolCall } from './index';

async function main() {
  console.log('ClawCart MCP Server');
  console.log('===================');
  console.log('');
  console.log('Available tools:');
  
  for (const tool of MCP_TOOLS) {
    console.log(`  - ${tool.name}: ${tool.description}`);
  }
  
  console.log('');
  console.log('To use with Claude Desktop or other MCP clients,');
  console.log('add this to your MCP config:');
  console.log('');
  console.log(JSON.stringify({
    mcpServers: {
      clawcart: {
        command: 'npx',
        args: ['@clawcart/mcp'],
      },
    },
  }, null, 2));
  console.log('');
  
  // In a real implementation, this would start the MCP server
  // and listen for tool calls via stdio
  console.log('Server ready. Waiting for tool calls...');
}

main().catch(console.error);
