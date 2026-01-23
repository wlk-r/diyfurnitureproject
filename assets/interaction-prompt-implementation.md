# Custom Interaction Prompt Implementation

## Files
- `assets/interaction-prompt.svg` - Custom SVG icon (67.07 x 42.09)

## How to Implement

### Option 1: Slot Approach (Recommended)

Add this inside each `<model-viewer>` element:

```html
<model-viewer ...>
    <div slot="interaction-prompt" class="custom-interaction-prompt">
        <img src="./assets/interaction-prompt.svg" alt="Drag to rotate">
    </div>
</model-viewer>
```

Add to CSS (style.css):

```css
/* Custom interaction prompt */
.custom-interaction-prompt {
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
}

.custom-interaction-prompt img {
    width: 67px;
    height: 42px;
    opacity: 0.7;
}
```

### Option 2: Inline SVG (Better Performance)

Replace the `<img>` tag with the SVG content directly:

```html
<div slot="interaction-prompt" class="custom-interaction-prompt">
    <svg xmlns="http://www.w3.org/2000/svg" width="67.07" height="42.09" viewBox="0 0 67.07 42.09">
        <!-- SVG content here -->
    </svg>
</div>
```

### For product-loader.js

Add the slot element inside the model-viewer template string after the effect-composer closing tag.
