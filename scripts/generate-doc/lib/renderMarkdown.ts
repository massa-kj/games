import type { DocumentationResult, ComponentDocumentation, PropInfo, ExampleInfo } from './types.js';

/**
 * Render documentation result as Markdown
 */
export function renderMarkdown(docs: DocumentationResult): string {
  const { modules, metadata } = docs;

  const sections = [
    renderHeader(metadata),
    ...modules.map(module => renderModule(module.moduleName, module.components))
  ];

  return sections.join('\n\n---\n\n');
}

function renderHeader(metadata: DocumentationResult['metadata']): string {
  const date = new Date(metadata.generatedAt).toLocaleDateString();

  return `# Core Module Documentation

**Generated:** ${date}
**Version:** ${metadata.version}
**Total Components:** ${metadata.totalComponents}

> This documentation is automatically generated from TSDoc comments in the \`core/\` directory.`;
}

function renderModule(moduleName: string, components: ComponentDocumentation[]): string {
  if (components.length === 0) {
    return '';
  }

  const moduleSection = `## ${moduleName}

${components.map(renderComponent).join('\n\n')}`;

  return moduleSection;
}

function renderComponent(component: ComponentDocumentation): string {
  const sections = [
    `### ${component.displayName}`,
    '',
    renderComponentSummary(component),
    renderComponentProps(component),
    renderComponentReturns(component),
    renderComponentRemarks(component),
    renderComponentExamples(component)
  ].filter(Boolean);

  return sections.join('\n');
}

function renderComponentSummary(component: ComponentDocumentation): string {
  const parts = [`**Type:** ${component.type}`];

  if (component.description) {
    parts.push(`**Summary:** ${component.description}`);
  }

  parts.push(`**File:** \`${component.filePath}\``);

  return parts.join('  \n');
}

function renderComponentProps(component: ComponentDocumentation): string {
  if (!component.props || component.props.length === 0) {
    return '';
  }

  const headers = '| Prop | Type | Default | Required | Description |';
  const separator = '|------|------|---------|----------|-------------|';
  const rows = component.props.map(renderPropRow);

  return [
    '',
    '**Props:**',
    '',
    headers,
    separator,
    ...rows
  ].join('\n');
}

function renderPropRow(prop: PropInfo): string {
  const name = prop.name;
  const type = `\`${prop.type}\``;
  const defaultValue = prop.defaultValue ? `\`${prop.defaultValue}\`` : '—';
  const required = prop.required ? '✓' : '—';
  const description = prop.description || '—';

  return `| ${name} | ${type} | ${defaultValue} | ${required} | ${description} |`;
}

function renderComponentReturns(component: ComponentDocumentation): string {
  if (!component.returns) {
    return '';
  }

  return `\n**Returns:** ${component.returns}`;
}

function renderComponentRemarks(component: ComponentDocumentation): string {
  if (!component.remarks) {
    return '';
  }

  return `\n**Remarks:** ${component.remarks}`;
}

function renderComponentExamples(component: ComponentDocumentation): string {
  if (component.examples.length === 0) {
    return '';
  }

  const exampleSections = component.examples.map((example, index) => {
    const title = component.examples.length > 1 ? `Example ${index + 1}` : 'Example';
    return renderExample(example, title);
  });

  return '\n' + exampleSections.join('\n\n');
}

function renderExample(example: ExampleInfo, title: string): string {
  return `**${title}:**
\`\`\`${example.language}
${example.code}
\`\`\``;
}
