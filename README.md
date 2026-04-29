# Polyring Embed Customizer

A small static page for previewing and exporting Polyring embed theme colors.

Live site: https://akuta.xyz/polyring

## Integrate With Polyring

1. Customize the banner colors in the preview.
2. Click **Export Theme JSON**.
3. Copy the exported CSS variables into the page that renders the Polyring banner.

Example:

```html
<webring-banner class="custom-polyring-theme" theme="dark"></webring-banner>

<style>
  .custom-polyring-theme {
    --background-color: #000000;
    --outer-border-color: #222222;
    --inner-border-color: #dddddd;
    --text-color: #dddddd;
    --href-color: #9f56ff;
    --href-color-active: #9f56ff;
  }
</style>
```

If the exported JSON contains `"--background-color": "transparent"`, use that value directly:

```css
.custom-polyring-theme {
  --background-color: transparent;
}
```
