/**
 * Type definitions for documentation generation system
 */

export interface PropInfo {
  name: string;
  type: string;
  defaultValue?: string;
  description?: string;
  required: boolean;
}

export interface ExampleInfo {
  title?: string;
  code: string;
  language: string;
}

export interface ComponentDocumentation {
  /** Component or function display name */
  displayName: string;
  /** File path relative to project root */
  filePath: string;
  /** Component description from TSDoc */
  description?: string;
  /** Component props information */
  props?: PropInfo[];
  /** Return type information for hooks/utilities */
  returns?: string;
  /** Additional remarks from TSDoc */
  remarks?: string;
  /** Code examples from TSDoc @example tags */
  examples: ExampleInfo[];
  /** Whether this is a React component, hook, or utility */
  type: 'component' | 'hook' | 'utility';
}

export interface ModuleDocumentation {
  /** Module name (e.g., 'ui', 'hooks', 'utils') */
  moduleName: string;
  /** All components/functions in this module */
  components: ComponentDocumentation[];
}

export interface DocumentationResult {
  /** All modules found */
  modules: ModuleDocumentation[];
  /** Generation metadata */
  metadata: {
    generatedAt: string;
    version: string;
    totalComponents: number;
  };
}

export interface GenerateOptions {
  /** Glob patterns for input files */
  modules: string[];
  /** Output file path */
  outputPath: string;
  /** Enable verbose logging */
  verbose: boolean;
}
