import { describe, it, expect } from 'vitest';
import { MCP_TOOLS } from '../index';

describe('MCP Server', () => {
  describe('MCP_TOOLS', () => {
    it('should export MCP tools array', () => {
      expect(MCP_TOOLS).toBeDefined();
      expect(Array.isArray(MCP_TOOLS)).toBe(true);
    });

    it('should include required tools', () => {
      const toolNames = MCP_TOOLS.map(t => t.name);
      expect(toolNames).toContain('clawcart_search');
      expect(toolNames).toContain('clawcart_add');
      expect(toolNames).toContain('clawcart_cart');
      expect(toolNames).toContain('clawcart_share');
    });

    it('should have valid tool schemas', () => {
      for (const tool of MCP_TOOLS) {
        expect(tool.name).toBeTruthy();
        expect(tool.description).toBeTruthy();
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe('object');
      }
    });

    it('clawcart_search should require query param', () => {
      const searchTool = MCP_TOOLS.find(t => t.name === 'clawcart_search');
      expect(searchTool?.inputSchema.required).toContain('query');
    });

    it('clawcart_add should have quantity default', () => {
      const addTool = MCP_TOOLS.find(t => t.name === 'clawcart_add');
      expect(addTool?.inputSchema.properties.quantity.default).toBe(1);
    });
  });
});
