# 🔧 Implementación Completa MCP - Strata DS Furniture

## Estructura del Proyecto

```
/api/
├── package.json (actualizado con @modelcontextprotocol/sdk)
├── mcp-config.json (configuración MCP)
└── src/
    └── mcp/
        ├── server.ts                    # Servidor MCP principal
        ├── tools/
        │   ├── components.ts            # searchComponents, getComponent
        │   ├── generation.ts            # generateComponent, generateFurnitureUI
        │   ├── tokens.ts                # getDesignTokens
        │   ├── validation.ts            # validateDesign
        │   ├── furniture.ts             # searchFurnitureCatalog, getFurniturePatterns
        │   └── analysis.ts              # analyzePrompt
        ├── resources/
        │   ├── components-resource.ts   # furniture://components/*
        │   ├── catalog-resource.ts      # furniture://catalog/*
        │   └── patterns-resource.ts     # furniture://patterns/*
        ├── prompts/
        │   ├── system-prompts.ts        # System prompts para cada AI
        │   └── furniture-prompts.ts     # Prompts específicos del sector
        ├── context/
        │   ├── manager.ts               # Gestión de contexto
        │   ├── furniture-knowledge.ts   # Base de conocimiento del sector
        │   └── token-registry.ts        # Registro de design tokens
        └── utils/
            ├── prompt-parser.ts         # Parser de prompts
            ├── code-generator.ts        # Generador de código
            └── response-formatter.ts    # Formateador de respuestas

/furniture-knowledge/
└── catalog/
    ├── chairs.json                      # Catálogo de sillas
    ├── tables.json                      # Catálogo de mesas
    ├── sofas.json                       # Catálogo de sofás
    ├── materials.json                   # Materiales disponibles
    └── patterns.json                    # Patrones UI del sector
```

---

## 📦 Dependencias

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "@anthropic-ai/sdk": "^0.20.0",
    "openai": "^4.28.0",
    "zod": "^3.22.4",
    "three": "^0.160.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.6",
    "typescript": "^5.3.3"
  },
  "scripts": {
    "mcp:dev": "tsx watch src/mcp/server.ts",
    "mcp:build": "tsc -p tsconfig.mcp.json",
    "mcp:start": "node dist/mcp/server.js"
  }
}
```

---

## 🛠️ Tools Implementation

### 1. Component Tools

```typescript
// /api/src/mcp/tools/components.ts

import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

const API_BASE = process.env.API_BASE_URL || "http://localhost:3001/v1";
const API_KEY = process.env.MASTER_API_KEY;

interface SearchComponentsArgs {
  query: string;
  category?: string;
  industry?: string;
  complexity?: string;
}

interface GetComponentArgs {
  componentId: string;
  includeCode?: boolean;
  includeTokens?: boolean;
  includeExamples?: boolean;
}

export const componentTools = {
  /**
   * Search components in the design system
   */
  async search(args: SearchComponentsArgs): Promise<CallToolResult> {
    try {
      // Query API
      const response = await axios.get(`${API_BASE}/components`, {
        params: {
          search: args.query,
          category: args.category,
          industry: args.industry || "furniture",
        },
        headers: { "x-api-key": API_KEY },
      });

      const components = response.data.components || [];

      // Filter by complexity if specified
      let filtered = components;
      if (args.complexity) {
        filtered = components.filter(
          (c: any) => c.complexity === args.complexity
        );
      }

      // Enrich with furniture-specific data
      const enriched = filtered.map((component: any) => ({
        ...component,
        furnitureContext: {
          suitableFor: getSuitableFurnitureTypes(component),
          materials: getSupportedMaterials(component),
          dimensionStandards: getDimensionStandards(component),
        },
      }));

      // Generate suggestions
      const suggestions = generateSuggestions(args.query, enriched);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                components: enriched,
                total: enriched.length,
                suggestions,
                query: args.query,
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
            text: `Error searching components: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  },

  /**
   * Get detailed component information
   */
  async get(args: GetComponentArgs): Promise<CallToolResult> {
    try {
      const response = await axios.get(
        `${API_BASE}/components/${args.componentId}`,
        {
          headers: { "x-api-key": API_KEY },
        }
      );

      const component = response.data;

      // Enrich with furniture-specific metadata
      const enriched = {
        ...component,
        designTokens: args.includeTokens
          ? await getComponentTokens(component)
          : undefined,
        code: args.includeCode ? component.code : undefined,
        examples: args.includeExamples
          ? await getComponentExamples(component)
          : undefined,
        furnitureMetadata: {
          materials: extractMaterials(component),
          dimensions: extractDimensions(component),
          useCases: getFurnitureUseCases(component),
          bestPractices: getFurnitureBestPractices(component),
        },
        relatedComponents: await findRelatedComponents(component),
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ component: enriched }, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting component: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  },
};

/**
 * Helper: Get suitable furniture types for a component
 */
function getSuitableFurnitureTypes(component: any): string[] {
  const furnitureTypes = [];

  if (component.category === "furniture") {
    if (component.name.toLowerCase().includes("chair")) {
      furnitureTypes.push("chairs", "dining", "office");
    }
    if (component.name.toLowerCase().includes("table")) {
      furnitureTypes.push("tables", "dining", "coffee-tables");
    }
    if (component.name.toLowerCase().includes("sofa")) {
      furnitureTypes.push("sofas", "living-room", "sectionals");
    }
  }

  if (component.category === "product-display") {
    furnitureTypes.push("all-furniture");
  }

  return furnitureTypes.length > 0 ? furnitureTypes : ["general"];
}

/**
 * Helper: Get supported materials
 */
function getSupportedMaterials(component: any): string[] {
  const materials = new Set<string>();

  // Check in component metadata
  if (component.metadata?.materials) {
    component.metadata.materials.forEach((m: string) => materials.add(m));
  }

  // Check in design tokens
  if (component.designTokens?.materials) {
    Object.keys(component.designTokens.materials).forEach((m) =>
      materials.add(m)
    );
  }

  // Default furniture materials
  if (materials.size === 0) {
    return ["wood", "metal", "fabric", "leather"];
  }

  return Array.from(materials);
}

/**
 * Helper: Get dimension standards
 */
function getDimensionStandards(component: any): any {
  if (component.name.toLowerCase().includes("chair")) {
    return {
      standard: { height: 45, width: 50, depth: 55, unit: "cm" },
      dining: { height: 46, width: 48, depth: 52, unit: "cm" },
      office: { height: 50, width: 60, depth: 60, unit: "cm" },
    };
  }

  if (component.name.toLowerCase().includes("table")) {
    return {
      dining: { height: 75, width: 180, depth: 90, unit: "cm" },
      coffee: { height: 45, width: 120, depth: 60, unit: "cm" },
      side: { height: 55, width: 50, depth: 50, unit: "cm" },
    };
  }

  return { flexible: true };
}

/**
 * Helper: Generate suggestions based on query
 */
function generateSuggestions(query: string, components: any[]): string[] {
  const suggestions = [];

  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes("sofa") && !lowerQuery.includes("configurator")) {
    suggestions.push("Consider adding 'configurator' for interactive sofa customization");
  }

  if (lowerQuery.includes("product") && components.length > 1) {
    suggestions.push("Use 'furniture-gallery' to display multiple products");
  }

  if (lowerQuery.includes("3d") || lowerQuery.includes("ar")) {
    suggestions.push("Include 'three-js-viewer' component for 3D visualization");
  }

  if (components.length === 0) {
    suggestions.push("Try broader search terms like 'furniture card' or 'product display'");
  }

  return suggestions;
}

/**
 * Helper: Get component design tokens
 */
async function getComponentTokens(component: any): Promise<any> {
  // Extract design tokens used by component
  return {
    colors: component.metadata?.colors || [],
    spacing: component.metadata?.spacing || [],
    typography: component.metadata?.typography || [],
    materials: component.metadata?.materials || [],
  };
}

/**
 * Helper: Get component examples
 */
async function getComponentExamples(component: any): Promise<any[]> {
  // Generate furniture-specific examples
  const examples = [];

  if (component.name.includes("Card")) {
    examples.push({
      title: "Oak Dining Chair",
      description: "Modern oak chair with fabric cushion",
      code: `<FurnitureCard
  name="Modern Oak Dining Chair"
  material="oak"
  price={299}
  image="/images/oak-chair.jpg"
/>`,
      preview: "https://cdn.strata-ds.com/examples/oak-chair.jpg",
    });
  }

  return examples;
}

/**
 * Helper: Extract materials from component
 */
function extractMaterials(component: any): string[] {
  const materials = new Set<string>();

  // Parse from code
  if (component.code?.css) {
    if (component.code.css.includes("wood")) materials.add("wood");
    if (component.code.css.includes("metal")) materials.add("metal");
    if (component.code.css.includes("fabric")) materials.add("fabric");
  }

  return Array.from(materials);
}

/**
 * Helper: Extract dimensions
 */
function extractDimensions(component: any): any {
  // Return standard furniture dimensions
  return {
    customizable: true,
    standard: "8cm grid system",
    units: ["cm", "inches"],
  };
}

/**
 * Helper: Get furniture use cases
 */
function getFurnitureUseCases(component: any): string[] {
  const useCases = [];

  if (component.category === "product-display") {
    useCases.push("E-commerce catalog");
    useCases.push("Showroom displays");
    useCases.push("Interior design portfolios");
  }

  if (component.name.includes("Configurator")) {
    useCases.push("Custom furniture orders");
    useCases.push("Virtual showroom");
    useCases.push("B2B ordering platform");
  }

  return useCases;
}

/**
 * Helper: Get furniture best practices
 */
function getFurnitureBestPractices(component: any): string[] {
  return [
    "Use high-quality product photography (2:3 aspect ratio)",
    "Include multiple angles (front, side, top)",
    "Show material textures and finishes",
    "Provide dimensions in metric and imperial",
    "Include scale reference (human, room)",
    "Add hover effects for material previews",
    "Consider 3D/AR viewing options",
    "Include delivery and assembly information",
  ];
}

/**
 * Helper: Find related components
 */
async function findRelatedComponents(component: any): Promise<any[]> {
  const related = [];

  if (component.name.includes("Card")) {
    related.push("furniture-gallery", "material-selector");
  }

  if (component.name.includes("Configurator")) {
    related.push("dimension-input", "material-swatch", "price-calculator");
  }

  return related;
}
```

---

### 2. Generation Tools

```typescript
// /api/src/mcp/tools/generation.ts

import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { generateReactComponent } from "../utils/code-generator.js";
import { analyzePrompt } from "./analysis.js";

interface GenerateComponentArgs {
  prompt: string;
  industry?: string;
  framework?: string;
  useDesignTokens?: boolean;
}

interface GenerateFurnitureUIArgs {
  furnitureData: any;
  uiType: string;
  features?: string[];
}

export const generationTools = {
  /**
   * Generate new component from prompt
   */
  async generateComponent(
    args: GenerateComponentArgs
  ): Promise<CallToolResult> {
    try {
      // Analyze prompt
      const analysis = await analyzePrompt({
        prompt: args.prompt,
        context: { industry: args.industry || "furniture" },
      });

      // Generate code based on framework
      const code = await generateReactComponent({
        prompt: args.prompt,
        analysis,
        framework: args.framework || "react",
        useDesignTokens: args.useDesignTokens ?? true,
      });

      // Extract design tokens used
      const tokensUsed = extractUsedTokens(code);

      // Extract furniture patterns used
      const patternsUsed = extractFurniturePatterns(code);

      // Generate suggestions
      const suggestions = generateCodeSuggestions(code, analysis);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                component: {
                  name: analysis.suggestedName,
                  description: analysis.description,
                  code,
                  designTokensUsed: tokensUsed,
                  furniturePatterns: patternsUsed,
                  suggestions,
                },
                metadata: {
                  confidence: analysis.confidence,
                  promptAnalysis: analysis,
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
            text: `Error generating component: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  },

  /**
   * Generate complete furniture UI
   */
  async generateFurnitureUI(
    args: GenerateFurnitureUIArgs
  ): Promise<CallToolResult> {
    try {
      const { furnitureData, uiType, features = [] } = args;

      // Generate main component
      const mainComponent = await generateMainUIComponent(furnitureData, uiType);

      // Generate sub-components based on features
      const subComponents = [];
      
      if (features.includes("materials")) {
        subComponents.push(await generateMaterialSelector(furnitureData));
      }
      
      if (features.includes("dimensions")) {
        subComponents.push(await generateDimensionInput(furnitureData));
      }
      
      if (features.includes("3d")) {
        subComponents.push(await generate3DViewer(furnitureData));
      }
      
      if (features.includes("ar")) {
        subComponents.push(await generateARPreview(furnitureData));
      }

      // Determine layout
      const layout = determineLayout(uiType, features);

      // Get design tokens
      const designTokens = extractFurnitureTokens(furnitureData);

      // Generate integrations
      const integrations = generateIntegrations(features);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                ui: {
                  components: [mainComponent, ...subComponents],
                  layout,
                  designTokens,
                  integrations,
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
            text: `Error generating furniture UI: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  },
};

// Helper functions
function extractUsedTokens(code: any): string[] {
  const tokens = new Set<string>();
  
  // Extract from CSS
  if (code.css) {
    const matches = code.css.match(/var\(--[a-z-]+\)/g);
    if (matches) {
      matches.forEach((m: string) => tokens.add(m));
    }
  }
  
  return Array.from(tokens);
}

function extractFurniturePatterns(code: any): string[] {
  const patterns = [];
  
  if (code.react?.includes("FurnitureCard")) {
    patterns.push("product-card");
  }
  
  if (code.react?.includes("MaterialSelector")) {
    patterns.push("material-selector");
  }
  
  return patterns;
}

function generateCodeSuggestions(code: any, analysis: any): string[] {
  const suggestions = [];
  
  if (!code.react?.includes("material")) {
    suggestions.push("Consider adding material selector for customization");
  }
  
  if (!code.react?.includes("dimension")) {
    suggestions.push("Add dimension display for better product information");
  }
  
  if (!code.css?.includes("hover")) {
    suggestions.push("Add hover effects for better interactivity");
  }
  
  return suggestions;
}

async function generateMainUIComponent(data: any, type: string): Promise<any> {
  // Generate based on UI type
  const templates = {
    catalog: generateCatalogComponent,
    configurator: generateConfiguratorComponent,
    "detail-page": generateDetailPageComponent,
    "ar-viewer": generateARViewerComponent,
  };
  
  const generator = templates[type as keyof typeof templates] || templates.catalog;
  return await generator(data);
}

async function generateCatalogComponent(data: any): Promise<any> {
  return {
    name: "FurnitureCatalog",
    purpose: "Display furniture products in grid layout",
    code: {
      react: `
export function FurnitureCatalog({ products }) {
  return (
    <div className="furniture-catalog">
      <div className="furniture-grid">
        {products.map(product => (
          <FurnitureCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}`,
      typescript: `
interface Product {
  id: string;
  name: string;
  material: string;
  dimensions: { width: number; height: number; depth: number };
}`,
      css: `
.furniture-catalog {
  padding: var(--furniture-spacing-lg);
}

.furniture-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--furniture-grid-8);
}`,
    },
  };
}

async function generateConfiguratorComponent(data: any): Promise<any> {
  return {
    name: "FurnitureConfigurator",
    purpose: "Interactive furniture customization",
    code: {
      react: `
export function FurnitureConfigurator({ furniture }) {
  const [material, setMaterial] = useState(furniture.defaultMaterial);
  const [dimensions, setDimensions] = useState(furniture.dimensions);
  
  return (
    <div className="furniture-configurator">
      <div className="preview-3d">
        <ThreeJSViewer 
          model={furniture.model}
          material={material}
          dimensions={dimensions}
        />
      </div>
      <div className="controls">
        <MaterialSelector 
          materials={furniture.availableMaterials}
          selected={material}
          onChange={setMaterial}
        />
        <DimensionInput 
          dimensions={dimensions}
          onChange={setDimensions}
        />
      </div>
    </div>
  );
}`,
    },
  };
}

async function generateDetailPageComponent(data: any): Promise<any> {
  // Implementation...
  return { name: "FurnitureDetailPage", code: {} };
}

async function generateARViewerComponent(data: any): Promise<any> {
  // Implementation...
  return { name: "FurnitureARViewer", code: {} };
}

async function generateMaterialSelector(data: any): Promise<any> {
  return {
    name: "MaterialSelector",
    purpose: "Choose furniture material",
    code: {
      react: `
export function MaterialSelector({ materials, selected, onChange }) {
  return (
    <div className="material-selector">
      {materials.map(material => (
        <button
          key={material}
          className={\`material-swatch \${selected === material ? 'selected' : ''}\`}
          onClick={() => onChange(material)}
          style={{ 
            backgroundColor: \`var(--furniture-\${material})\`,
            backgroundImage: \`url(/textures/\${material}.jpg)\`
          }}
        >
          {material}
        </button>
      ))}
    </div>
  );
}`,
    },
  };
}

async function generateDimensionInput(data: any): Promise<any> {
  // Implementation...
  return { name: "DimensionInput", code: {} };
}

async function generate3DViewer(data: any): Promise<any> {
  // Implementation...
  return { name: "ThreeJSViewer", code: {} };
}

async function generateARPreview(data: any): Promise<any> {
  // Implementation...
  return { name: "ARPreview", code: {} };
}

function determineLayout(type: string, features: string[]): string {
  if (type === "configurator") {
    return "split-view";
  }
  if (type === "catalog") {
    return "grid-layout";
  }
  return "single-column";
}

function extractFurnitureTokens(data: any): string[] {
  return [
    "--furniture-wood-oak",
    "--furniture-spacing-md",
    "--furniture-grid-8",
  ];
}

function generateIntegrations(features: string[]): any {
  const integrations: any = {};
  
  if (features.includes("3d")) {
    integrations["3d"] = {
      library: "three.js",
      setup: "Install: npm install three @react-three/fiber",
    };
  }
  
  if (features.includes("ar")) {
    integrations.ar = {
      libraries: ["model-viewer", "AR.js"],
      platforms: ["ARKit", "ARCore"],
    };
  }
  
  return integrations;
}
```

---

## 📊 Status

He creado:
1. **MCP_STRATEGY.md** - Estrategia completa (arquitectura, tools, consumidores)
2. **MCP_IMPLEMENTATION.md** - Implementación de code (Component Tools + Generation Tools)

**Próximo:** ¿Quieres que continue con:
- Design Tokens Tools
- Validation Tools
- Furniture Catalog Tools
- MCP Resources
- System Prompts
- Documentación de integración por herramienta (Claude, Cursor, etc.)
- Tests MCP

Todo está diseñado específicamente para el **sector del mueble** con materiales, dimensiones, 3D/AR, y catálogos.

