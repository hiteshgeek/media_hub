# Instructions for Creating a Visual Config Builder

Use these instructions to have Claude create a visual configuration builder for your JavaScript component/library.

---

## Task: Create a Visual Configuration Builder

I need you to create a visual configuration builder similar to what we built for FileUploader. Here's the context and requirements:

---

## 1. Project Context

**Provide the following information:**

- Name of your main component/library (e.g., "FileUploader", "DataTable", "FormValidator")
- The main JavaScript class file path
- List of all configurable options with their types and defaults
- Any CSS variables used for theming

---

## 2. Architecture Overview

The config builder should have:

### A. Main Class Structure

```javascript
class ConfigBuilder {
  constructor(element, options = {})
  // element: DOM element or selector to mount the builder
  // options: { onConfigChange: callback, previewSelector: string }

  // Core properties:
  // - optionDefinitions: Object with categorized options metadata
  // - styleDefinitions: Object with CSS variable definitions
  // - config: Current configuration values
  // - styleValues: Current CSS variable values
  // - uploaderInstances: Preview instances (rename to match your component)
}
```

### B. Option Definitions Format

```javascript
optionDefinitions = {
  categoryKey: {
    title: "Category Display Name",
    icon: "iconName",
    options: {
      optionName: {
        type: "text|number|boolean|select|size|extensions|mimeTypes|typeSize|typeCount",
        default: defaultValue,
        label: "Display Label",
        hint: "Tooltip description",
        min: 0,           // for numbers
        max: 100,         // for numbers
        step: 1,          // for numbers
        options: [        // for select type
          { value: "opt1", label: "Option 1" },
          { value: "opt2", label: "Option 2" }
        ],
        dependsOn: "parentOption",        // conditional visibility
        affectsOptions: ["child1", "child2"], // marks as parent
        group: "Group Name"               // visual grouping within category
      }
    }
  }
}
```

### C. Style Definitions Format

```javascript
styleDefinitions = {
  sectionKey: {
    title: "Section Name",
    icon: "iconName",
    variables: {
      "--css-var-name": {
        type: "color|size|text",
        default: "#hex or value",
        label: "Display Label"
      }
    }
  }
}
```

---

## 3. UI Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Header: Title + Theme Switcher (light/dark/system)          │
├─────────────────────────────────────────────────────────────┤
│ ┌───────────────────────┐ ┌───────────────────────────────┐ │
│ │ Options Panel         │ │ Preview Panel                 │ │
│ │ ┌──────┬────────────┐ │ │ ┌─────────────────────────┐   │ │
│ │ │Tabs  │ Content    │ │ │ │ Live Component Preview  │   │ │
│ │ │(vert)│            │ │ │ └─────────────────────────┘   │ │
│ │ │      │ Search     │ │ │ ┌─────────────────────────┐   │ │
│ │ │Cat1  │ Presets    │ │ │ │ Code Output (JS/PHP)    │   │ │
│ │ │Cat2  │ Options... │ │ │ └─────────────────────────┘   │ │
│ │ │Cat3  │            │ │ │                               │ │
│ │ └──────┴────────────┘ │ │                               │ │
│ └───────────────────────┘ └───────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Key Features to Implement

1. **Two Main Tabs:** Configuration (JS options) + Styles (CSS variables)
2. **Vertical Category Navigation:** Left sidebar with icons and labels
3. **Option Search:** Filter options across all categories
4. **Presets System:** Quick-apply predefined configurations
5. **Live Preview:** Real-time component instance with current config
6. **Code Output:**
   - JavaScript initialization code
   - PHP server-side config (if applicable)
   - Copy to clipboard functionality
7. **Theme Support:** Light/dark/system modes with localStorage persistence
8. **Dependency System:** Show/hide options based on parent option values
9. **Input Types:**
   - Text inputs
   - Number inputs with +/- buttons
   - Boolean toggles
   - Select dropdowns
   - File size inputs (with unit conversion: bytes/KB/MB/GB)
   - Extension pickers (visual checkboxes by type groups)
   - Color pickers (for CSS variables)
10. **State Persistence:** Save active category, theme to localStorage

---

## 5. Files to Create

| File | Description |
|------|-------------|
| `ConfigBuilder.js` | Main class (~3000-5000 lines) |
| `_config-builder.scss` | Styles for the builder UI |
| `config-builder.php` (or `.html`) | Entry page |

---

## 6. Information You Must Provide

To start building, please provide:

### 6.1 Component's Default Options
Full list with types and default values:
```javascript
// Example:
{
  uploadUrl: { type: "text", default: "./upload.php" },
  maxFiles: { type: "number", default: 10, min: 1, max: 100 },
  multiple: { type: "boolean", default: true },
  // ... etc
}
```

### 6.2 CSS Variables
All customizable style variables:
```javascript
// Example:
{
  "--primary-color": "#4299e1",
  "--border-radius": "8px",
  "--font-size": "14px",
  // ... etc
}
```

### 6.3 Category Groupings
How to organize options logically:
```javascript
// Example:
{
  urls: ["uploadUrl", "deleteUrl", "configUrl"],
  limits: ["maxFiles", "maxSize", "allowedTypes"],
  behavior: ["autoUpload", "multiple", "dragDrop"],
  display: ["showProgress", "showThumbnails"],
}
```

### 6.4 Presets
Any preset configurations:
```javascript
// Example:
{
  minimal: { maxFiles: 1, showProgress: false },
  imagesOnly: { allowedTypes: ["image/*"], maxSize: "5MB" },
  // ... etc
}
```

### 6.5 Special Input Types
Any custom inputs needed (file extensions, MIME types, custom selectors, etc.)

---

## 7. Integration Requirements

The ConfigBuilder should:

- Import your main component class
- Call a static method like `YourComponent.getDefaultOptions()` to get defaults
- Instantiate preview instances with `new YourComponent(element, config)`
- Support destroying/recreating instances on config change

---

## 8. Example Usage After Completion

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Component Configuration Builder</title>
  <link rel="stylesheet" href="path/to/config-builder.css">
  <link rel="stylesheet" href="path/to/your-component.css">
</head>
<body>
  <div id="configBuilder"></div>

  <script src="path/to/your-component.js"></script>
  <script type="module">
    import ConfigBuilder from './ConfigBuilder.js';

    const builder = new ConfigBuilder('#configBuilder', {
      onConfigChange: (config) => {
        console.log('Config changed:', config);
      }
    });

    // Make globally accessible for debugging
    window.configBuilder = builder;
  </script>
</body>
</html>
```

---

## 9. Reference Implementation

This config builder pattern was originally built for the FileUploader component with:

- **~50+ configurable options** across 10+ categories
- **~80+ CSS variables** for complete theming
- **6 presets** (default, minimal, images-only, documents, media, secure)
- **Live preview** with multiple uploader instances
- **Code export** in JavaScript and PHP formats

---

## Quick Start Checklist

- [ ] Identify your main component class and file path
- [ ] List all configurable options with types/defaults
- [ ] List all CSS variables for theming
- [ ] Group options into logical categories
- [ ] Define any presets you want
- [ ] Identify any special input types needed
- [ ] Share this information with Claude to begin building

---

*Save these instructions and share them in a new Claude conversation along with the required information from Section 6 to create a ConfigBuilder for your specific project.*
