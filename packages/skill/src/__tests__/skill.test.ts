import { describe, it, expect } from 'vitest';
import { skillConfig } from '../index';

describe('OpenClaw Skill', () => {
  describe('skillConfig', () => {
    it('should export skill configuration', () => {
      expect(skillConfig).toBeDefined();
    });

    it('should have required metadata', () => {
      expect(skillConfig.name).toBe('clawcart');
      expect(skillConfig.description).toBeTruthy();
      expect(skillConfig.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('should include required tools', () => {
      const toolNames = skillConfig.tools.map(t => t.name);
      expect(toolNames).toContain('clawcart_search');
      expect(toolNames).toContain('clawcart_add');
      expect(toolNames).toContain('clawcart_cart');
      expect(toolNames).toContain('clawcart_share');
    });

    it('should have valid tool schemas', () => {
      for (const tool of skillConfig.tools) {
        expect(tool.name).toBeTruthy();
        expect(tool.description).toBeTruthy();
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe('object');
      }
    });

    it('clawcart_search should require query param', () => {
      const searchTool = skillConfig.tools.find(t => t.name === 'clawcart_search');
      expect(searchTool?.inputSchema.required).toContain('query');
    });
  });
});
