# 🔨 MCP Tools Completos - Implementación

## Tokens, Validation, Furniture & Analysis Tools

### 3. Design Tokens Tools

```typescript
// /api/src/mcp/tools/tokens.ts

import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { furnitureTokens } from "../context/furniture-knowledge.js";

interface GetDesignTokensArgs {
  category?: string;
  industry?: string;
  format?: string;
}

export const tokenTools = {
  /**
   * Get design tokens
   */
  async get(args: GetDesignTokensArgs): Promise<CallToolResult> {
    try {
      const {
        category = "all",
        industry = "furniture",
        format = "css",
      } = args;

      // Get tokens based on category
      let tokens: any = {};

      if (category === "all" || category === "colors") {
        tokens.colors = furnitureTokens.colors;
      }

      if (category === "all" || category === "materials") {
        tokens.materials = furnitureTokens.materials;
      }

      if (category === "all" || category === "dimensions") {
        tokens.dimensions = furnitureTokens.dimensions;
      }

      if (category === "all" || category === "spacing") {
        tokens.spacing = furnitureTokens.spacing;
      }

      if (category === "all" || category === "typography") {
        tokens.typography = furnitureTokens.typography;
      }

      // Format tokens based on requested format
      const formatted = formatTokens(tokens, format);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                tokens: formatted,
                format,
                version: "2.0.0",
                industry,
                usage: getTokenUsageExamples(category, format),
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting design tokens: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  },
};

/**
 * Format tokens based on output format
 */
function formatTokens(tokens: any, format: string): any {
  switch (format) {
    case "css":
      return formatAsCSS(tokens);
    case "scss":
      return formatAsSCSS(tokens);
    case "json":
      return tokens; // Already JSON
    case "js":
      return formatAsJS(tokens);
    default:
      return tokens;
  }
}

function formatAsCSS(tokens: any): string {
  let css = ":root {\n";

  // Colors
  if (tokens.colors) {
    css += "  /* Furniture Colors */\n";
    Object.entries(tokens.colors.furniture || {}).forEach(([category, values]) => {
      Object.entries(values as any).forEach(([name, value]) => {
        css += `  --furniture-${category}-${name}: ${value};\n`;
      });
    });
  }

  // Materials
  if (tokens.materials) {
    css += "\n  /* Materials */\n";
    Object.entries(tokens.materials).forEach(([material, props]: [string, any]) => {
      css += `  --material-${material}-texture: ${props.texture};\n`;
      if (props.color) {
        css += `  --material-${material}-color: ${props.color};\n`;
      }
    });
  }

  // Dimensions
  if (tokens.dimensions) {
    css += "\n  /* Furniture Dimensions */\n";
    Object.entries(tokens.dimensions.furniture || {}).forEach(([type, sizes]) => {
      Object.entries(sizes as any).forEach(([size, value]: [string, any]) => {
        css += `  --furniture-${type}-${size}-width: ${value.width}cm;\n`;
        css += `  --furniture-${type}-${size}-height: ${value.height}cm;\n`;
        css += `  --furniture-${type}-${size}-depth: ${value.depth}cm;\n`;
      });
    });
  }

  // Spacing
  if (tokens.spacing) {
    css += "\n  /* Spacing (8cm grid) */\n";
    Object.entries(tokens.spacing).forEach(([name, value]) => {
      css += `  --furniture-spacing-${name}: ${value};\n`;
    });
  }

  css += "}\n";
  return css;
}

function formatAsSCSS(tokens: any): string {
  let scss = "// Furniture Design Tokens\n\n";

  if (tokens.colors) {
    scss += "// Colors\n";
    Object.entries(tokens.colors.furniture || {}).forEach(([category, values]) => {
      Object.entries(values as any).forEach(([name, value]) => {
        scss += `$furniture-${category}-${name}: ${value};\n`;
      });
    });
  }

  return scss;
}

function formatAsJS(tokens: any): string {
  return `export const furnitureTokens = ${JSON.stringify(tokens, null, 2)};`;
}

function getTokenUsageExamples(category: string, format: string): string[] {
  const examples: string[] = [];

  if (format === "css") {
    examples.push("background-color: var(--furniture-wood-oak);");
    examples.push("width: var(--furniture-chair-standard-width);");
    examples.push("padding: var(--furniture-spacing-md);");
  }

  if (format === "scss") {
    examples.push("background-color: $furniture-wood-oak;");
    examples.push("width: $furniture-chair-standard-width;");
  }

  return examples;
}
```

---

### 4. Validation Tools

```typescript
// /api/src/mcp/tools/validation.ts

import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { furnitureTokens } from "../context/furniture-knowledge.js";

interface ValidateDesignArgs {
  code: string;
  checkTokens?: boolean;
  checkPatterns?: boolean;
  industry?: string;
}

interface ValidationError {
  severity: "error" | "warning" | "info";
  message: string;
  location?: string;
  suggestion: string;
}

export const validationTools = {
  /**
   * Validate design against Design System
   */
  async validate(args: ValidateDesignArgs): Promise<CallToolResult> {
    try {
      const {
        code,
        checkTokens = true,
        checkPatterns = true,
        industry = "furniture",
      } = args;

      const errors: ValidationError[] = [];
      const warnings: ValidationError[] = [];

      // Check for hardcoded values vs design tokens
      if (checkTokens) {
        const tokenIssues = validateTokenUsage(code);
        errors.push(...tokenIssues.errors);
        warnings.push(...tokenIssues.warnings);
      }

      // Check for furniture-specific patterns
      if (checkPatterns && industry === "furniture") {
        const patternIssues = validateFurniturePatterns(code);
        errors.push(...patternIssues.errors);
        warnings.push(...patternIssues.warnings);
      }

      // Check accessibility
      const a11yIssues = validateAccessibility(code);
      warnings.push(...a11yIssues);

      // Check performance
      const perfIssues = validatePerformance(code);
      warnings.push(...perfIssues);

      // Calculate score
      const score = calculateScore(errors, warnings);

      // Generate improvements
      const improvements = generateImprovements(errors, warnings);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                valid: errors.length === 0,
                errors,
                warnings,
                score,
                improvements,
                summary: {
                  totalIssues: errors.length + warnings.length,
                  criticalErrors: errors.filter((e) => e.severity === "error")
                    .length,
                  warnings: warnings.length,
                },
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error validating design: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  },
};

/**
 * Validate token usage
 */
function validateTokenUsage(code: string): {
  errors: ValidationError[];
  warnings: ValidationError[];
} {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Check for hardcoded colors
  const colorRegex = /#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|rgb\(|rgba\(/g;
  const colorMatches = code.match(colorRegex);

  if (colorMatches) {
    colorMatches.forEach((match, index) => {
      const lineNumber = code.substring(0, code.indexOf(match)).split("\n").length;
      
      errors.push({
        severity: "error",
        message: `Hardcoded color '${match}' found`,
        location: `line ${lineNumber}`,
        suggestion: "Use design token: var(--furniture-wood-oak) or similar",
      });
    });
  }

  // Check for hardcoded dimensions
  const dimensionRegex = /width:\s*\d+px|height:\s*\d+px/g;
  const dimensionMatches = code.match(dimensionRegex);

  if (dimensionMatches) {
    dimensionMatches.forEach((match) => {
      warnings.push({
        severity: "warning",
        message: `Hardcoded dimension '${match}' found`,
        location: "CSS",
        suggestion: "Use furniture dimension tokens or 8cm grid system",
      });
    });
  }

  // Check for missing var() usage
  if (code.includes("--furniture-") && !code.includes("var(--furniture-")) {
    warnings.push({
      severity: "warning",
      message: "CSS custom property defined but not used with var()",
      location: "CSS",
      suggestion: "Use var(--furniture-*) to reference custom properties",
    });
  }

  return { errors, warnings };
}

/**
 * Validate furniture-specific patterns
 */
function validateFurniturePatterns(code: string): {
  errors: ValidationError[];
  warnings: ValidationError[];
} {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Check for furniture image aspect ratios
  if (code.includes("<img") && !code.includes("aspect-ratio")) {
    warnings.push({
      severity: "warning",
      message: "Furniture images should use 2:3 aspect ratio",
      location: "HTML/JSX",
      suggestion: "Add aspect-ratio: 2/3 or use furniture-image class",
    });
  }

  // Check for material textures
  if (code.includes("material") && !code.includes("texture")) {
    warnings.push({
      severity: "warning",
      message: "Material components should include texture",
      location: "Component",
      suggestion: "Add material texture for realistic preview",
    });
  }

  // Check for dimension display
  if (
    (code.includes("table") ||
      code.includes("chair") ||
      code.includes("sofa")) &&
    !code.includes("dimension")
  ) {
    warnings.push({
      severity: "warning",
      message: "Furniture products should display dimensions",
      location: "Component",
      suggestion: "Add dimension display (width x height x depth)",
    });
  }

  // Check for 8cm grid usage
  if (code.includes("grid") && !code.includes("furniture-grid-8")) {
    warnings.push({
      severity: "info",
      message: "Consider using furniture 8cm grid system",
      location: "Layout",
      suggestion: "Use --furniture-grid-8 for consistent spacing",
    });
  }

  return { errors, warnings };
}

/**
 * Validate accessibility
 */
function validateAccessibility(code: string): ValidationError[] {
  const warnings: ValidationError[] = [];

  // Check for alt text on images
  if (code.includes("<img") && !code.includes('alt=')) {
    warnings.push({
      severity: "warning",
      message: "Images missing alt text",
      location: "HTML/JSX",
      suggestion: "Add descriptive alt text for furniture images",
    });
  }

  // Check for ARIA labels on interactive elements
  if (
    (code.includes("<button") || code.includes("onClick")) &&
    !code.includes("aria-label")
  ) {
    warnings.push({
      severity: "info",
      message: "Consider adding ARIA labels to interactive elements",
      location: "Component",
      suggestion: "Add aria-label for better screen reader support",
    });
  }

  return warnings;
}

/**
 * Validate performance
 */
function validatePerformance(code: string): ValidationError[] {
  const warnings: ValidationError[] = [];

  // Check for lazy loading on images
  if (code.includes("<img") && !code.includes("loading=")) {
    warnings.push({
      severity: "info",
      message: "Consider lazy loading for furniture images",
      location: "HTML/JSX",
      suggestion: 'Add loading="lazy" for better performance',
    });
  }

  // Check for optimized image formats
  if (code.includes(".jpg") || code.includes(".png")) {
    warnings.push({
      severity: "info",
      message: "Consider using WebP format for furniture images",
      location: "Images",
      suggestion: "Use .webp with .jpg fallback for better compression",
    });
  }

  return warnings;
}

/**
 * Calculate validation score
 */
function calculateScore(
  errors: ValidationError[],
  warnings: ValidationError[]
): number {
  const errorPenalty = errors.length * 10;
  const warningPenalty = warnings.length * 3;
  const totalPenalty = errorPenalty + warningPenalty;

  return Math.max(0, 100 - totalPenalty);
}

/**
 * Generate improvement suggestions
 */
function generateImprovements(
  errors: ValidationError[],
  warnings: ValidationError[]
): string[] {
  const improvements: string[] = [];

  // Count issue types
  const hardcodedColors = errors.filter((e) =>
    e.message.includes("Hardcoded color")
  ).length;
  const missingTokens = errors.filter((e) =>
    e.message.includes("design token")
  ).length;
  const patternIssues = warnings.filter((w) =>
    w.message.includes("pattern")
  ).length;

  if (hardcodedColors > 0) {
    improvements.push(
      `Replace ${hardcodedColors} hardcoded color(s) with furniture design tokens`
    );
  }

  if (missingTokens > 0) {
    improvements.push("Use furniture-specific spacing scale");
  }

  if (patternIssues > 0) {
    improvements.push("Follow furniture industry UI patterns");
  }

  if (warnings.some((w) => w.message.includes("texture"))) {
    improvements.push("Add material textures for realistic preview");
  }

  if (warnings.some((w) => w.message.includes("dimension"))) {
    improvements.push("Include furniture dimensions in component");
  }

  return improvements;
}
```

---

### 5. Furniture Catalog Tools

```typescript
// /api/src/mcp/tools/furniture.ts

import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { furnitureCatalog } from "../context/furniture-knowledge.js";

interface SearchFurnitureCatalogArgs {
  furnitureType?: string;
  style?: string;
  material?: string;
  priceRange?: { min: number; max: number };
}

interface GetFurniturePatternsArgs {
  patternType?: string;
  useCase?: string;
}

export const furnitureTools = {
  /**
   * Search furniture catalog
   */
  async searchCatalog(
    args: SearchFurnitureCatalogArgs
  ): Promise<CallToolResult> {
    try {
      const { furnitureType, style, material, priceRange } = args;

      // Filter catalog
      let results = furnitureCatalog.items;

      if (furnitureType && furnitureType !== "all") {
        results = results.filter((item) => item.type === furnitureType);
      }

      if (style) {
        results = results.filter((item) => item.style === style);
      }

      if (material) {
        results = results.filter((item) =>
          item.materials.includes(material)
        );
      }

      if (priceRange) {
        results = results.filter(
          (item) =>
            item.price >= priceRange.min && item.price <= priceRange.max
        );
      }

      // Enrich with component information
      const enriched = results.map((item) => ({
        ...item,
        components: getRelevantComponents(item),
        codeTemplates: getCodeTemplates(item),
        designTokens: getItemDesignTokens(item),
      }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                items: enriched,
                total: enriched.length,
                filters: { furnitureType, style, material },
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error searching catalog: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  },

  /**
   * Generate complete furniture UI
   */
  async generateUI(args: any): Promise<CallToolResult> {
    // Implementation from generation.ts
    return {
      content: [
        {
          type: "text",
          text: "See generation.ts for implementation",
        },
      ],
    };
  },

  /**
   * Get furniture industry patterns
   */
  async getPatterns(
    args: GetFurniturePatternsArgs
  ): Promise<CallToolResult> {
    try {
      const { patternType = "all", useCase = "all" } = args;

      const patterns = furnitureCatalog.patterns.filter((pattern) => {
        if (patternType !== "all" && pattern.type !== patternType) {
          return false;
        }
        if (useCase !== "all" && !pattern.useCases.includes(useCase)) {
          return false;
        }
        return true;
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                patterns: patterns.map((p) => ({
                  name: p.name,
                  description: p.description,
                  type: p.type,
                  useCases: p.useCases,
                  code: p.code,
                  examples: p.examples,
                  bestPractices: p.bestPractices,
                })),
                total: patterns.length,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting patterns: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  },
};

function getRelevantComponents(item: any): string[] {
  const components = ["furniture-product-card"];

  if (item.customizable) {
    components.push("furniture-configurator");
  }

  if (item.has3D) {
    components.push("three-js-viewer");
  }

  components.push("material-selector", "dimension-display");

  return components;
}

function getCodeTemplates(item: any): any {
  return {
    productDisplay: `<FurnitureCard 
  id="${item.id}"
  name="${item.name}"
  type="${item.type}"
  material="${item.materials[0]}"
  price={${item.price}}
/>`,
    configurator: item.customizable
      ? `<FurnitureConfigurator 
  furnitureType="${item.type}"
  materials={${JSON.stringify(item.materials)}}
  dimensions={${JSON.stringify(item.dimensions)}}
/>`
      : null,
  };
}

function getItemDesignTokens(item: any): string[] {
  const tokens = [];

  item.materials.forEach((material: string) => {
    tokens.push(`--furniture-${material}-color`);
    tokens.push(`--furniture-${material}-texture`);
  });

  tokens.push(`--furniture-${item.type}-dimensions`);

  return tokens;
}
```

---

### 6. Analysis Tool

```typescript
// /api/src/mcp/tools/analysis.ts

import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

interface AnalyzePromptArgs {
  prompt: string;
  context?: any;
}

export async function analyzePrompt(
  args: AnalyzePromptArgs
): Promise<any> {
  const { prompt, context = {} } = args;

  // Extract intent
  const intent = extractIntent(prompt);

  // Extract industry
  const industry = context.industry || detectIndustry(prompt);

  // Extract furniture type
  const furnitureType = extractFurnitureType(prompt);

  // Extract features
  const features = extractFeatures(prompt);

  // Suggest components
  const componentsSuggested = suggestComponents(intent, furnitureType, features);

  // Suggest design tokens
  const designTokens = suggestTokens(furnitureType, features);

  // Generate implementation steps
  const implementationSteps = generateSteps(intent, componentsSuggested);

  // Calculate confidence
  const confidence = calculateConfidence(prompt, componentsSuggested);

  return {
    intent,
    industry,
    furnitureType,
    features,
    componentsSuggested,
    designTokens,
    implementationSteps,
    confidence,
    suggestedName: generateComponentName(intent, furnitureType),
    description: generateDescription(intent, furnitureType),
  };
}

export const analysisTools = {
  async analyzePrompt(args: AnalyzePromptArgs): Promise<CallToolResult> {
    try {
      const analysis = await analyzePrompt(args);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ analysis }, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error analyzing prompt: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  },
};

// Helper functions
function extractIntent(prompt: string): string {
  const lower = prompt.toLowerCase();

  if (lower.includes("create") || lower.includes("build") || lower.includes("generate")) {
    return "create";
  }
  if (lower.includes("show") || lower.includes("display") || lower.includes("list")) {
    return "display";
  }
  if (lower.includes("configure") || lower.includes("customize")) {
    return "configure";
  }
  if (lower.includes("catalog") || lower.includes("gallery")) {
    return "catalog";
  }

  return "create";
}

function detectIndustry(prompt: string): string {
  const lower = prompt.toLowerCase();

  if (
    lower.includes("furniture") ||
    lower.includes("chair") ||
    lower.includes("table") ||
    lower.includes("sofa")
  ) {
    return "furniture";
  }

  return "general";
}

function extractFurnitureType(prompt: string): string | null {
  const lower = prompt.toLowerCase();

  if (lower.includes("chair")) return "chair";
  if (lower.includes("table")) return "table";
  if (lower.includes("sofa") || lower.includes("couch")) return "sofa";
  if (lower.includes("cabinet") || lower.includes("storage")) return "cabinet";
  if (lower.includes("bed")) return "bed";

  return null;
}

function extractFeatures(prompt: string): string[] {
  const features = [];
  const lower = prompt.toLowerCase();

  if (lower.includes("3d")) features.push("3d");
  if (lower.includes("ar") || lower.includes("augmented reality")) features.push("ar");
  if (lower.includes("material")) features.push("materials");
  if (lower.includes("dimension")) features.push("dimensions");
  if (lower.includes("interactive")) features.push("interactive");
  if (lower.includes("configurator") || lower.includes("customizable")) features.push("configurator");

  return features;
}

function suggestComponents(
  intent: string,
  furnitureType: string | null,
  features: string[]
): any[] {
  const suggestions = [];

  if (intent === "catalog" || intent === "display") {
    suggestions.push({
      component: "furniture-grid",
      confidence: 0.95,
      reason: "Grid layout for displaying multiple products",
    });
  }

  if (features.includes("configurator")) {
    suggestions.push({
      component: "furniture-configurator",
      confidence: 0.92,
      reason: "Interactive customization for furniture",
    });
  }

  if (features.includes("3d")) {
    suggestions.push({
      component: "three-js-viewer",
      confidence: 0.88,
      reason: "3D visualization capability requested",
    });
  }

  suggestions.push({
    component: "furniture-product-card",
    confidence: 0.85,
    reason: "Standard component for furniture display",
  });

  return suggestions;
}

function suggestTokens(furnitureType: string | null, features: string[]): string[] {
  const tokens = [
    "furniture-colors",
    "furniture-spacing",
    "furniture-typography",
  ];

  if (furnitureType) {
    tokens.push(`furniture-${furnitureType}-dimensions`);
  }

  if (features.includes("materials")) {
    tokens.push("furniture-materials");
  }

  return tokens;
}

function generateSteps(intent: string, components: any[]): string[] {
  const steps = [];

  if (intent === "catalog") {
    steps.push("1. Set up furniture grid with responsive columns");
    steps.push("2. Add filter panel with material/style options");
    steps.push("3. Implement product cards with hover effects");
    steps.push("4. Add pagination or infinite scroll");
    steps.push("5. Connect to inventory API");
  } else if (intent === "configure") {
    steps.push("1. Create configurator layout (preview + controls)");
    steps.push("2. Add material selector component");
    steps.push("3. Implement dimension input controls");
    steps.push("4. Add 3D viewer with real-time updates");
    steps.push("5. Include price calculator");
  } else {
    steps.push("1. Define component structure");
    steps.push("2. Apply furniture design tokens");
    steps.push("3. Implement responsive layout");
    steps.push("4. Add interactions and animations");
    steps.push("5. Test with different furniture types");
  }

  return steps;
}

function calculateConfidence(prompt: string, suggestions: any[]): number {
  let confidence = 0.5; // Base confidence

  // Increase if prompt is specific
  if (prompt.length > 50) confidence += 0.1;
  if (prompt.split(" ").length > 10) confidence += 0.1;

  // Increase if furniture type detected
  if (extractFurnitureType(prompt)) confidence += 0.15;

  // Increase if features detected
  const features = extractFeatures(prompt);
  confidence += features.length * 0.05;

  // Increase if components have high confidence
  const avgComponentConfidence =
    suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length;
  confidence = (confidence + avgComponentConfidence) / 2;

  return Math.min(0.99, confidence);
}

function generateComponentName(intent: string, furnitureType: string | null): string {
  if (intent === "catalog") {
    return furnitureType ? `${capitalize(furnitureType)}Catalog` : "FurnitureCatalog";
  }
  if (intent === "configure") {
    return furnitureType
      ? `${capitalize(furnitureType)}Configurator`
      : "FurnitureConfigurator";
  }
  return furnitureType ? `${capitalize(furnitureType)}Component` : "FurnitureComponent";
}

function generateDescription(intent: string, furnitureType: string | null): string {
  const type = furnitureType || "furniture";
  
  if (intent === "catalog") {
    return `Catalog display for ${type} products with filtering and grid layout`;
  }
  if (intent === "configure") {
    return `Interactive configurator for customizing ${type} with materials and dimensions`;
  }
  return `Component for displaying and interacting with ${type} products`;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
```

---

## 📊 Status

**Completado:**
- ✅ Component Tools (search, get)
- ✅ Generation Tools (generate, generateFurnitureUI)
- ✅ Design Token Tools (get, format)
- ✅ Validation Tools (validate design against DS)
- ✅ Furniture Tools (searchCatalog, getPatterns)
- ✅ Analysis Tools (analyzePrompt)

**Próximo:**
- MCP Resources (furniture://*)
- System Prompts (Claude, Cursor, etc.)
- Furniture Knowledge Base (catálogos JSON)
- Integration Guides
- Tests

¿Continúo con los prompts y recursos?
