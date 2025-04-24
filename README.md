[![Frame0 MCP Video Example](https://github.com/niklauslee/frame0-mcp-server/raw/main/thumbnail.png)](https://frame0.app/videos/frame0-mcp-example.mp4)

# Frame0 MCP Server

[Frame0](https://frame0.app/) is a Balsamiq-alternative wireframe tool for modern apps. **Frame0 MCP Server** allows you for creating and modifying wireframes in Frame0 by prompting.

## Setup

Prerequisite:
- [Frame0](https://frame0.app/) `v1.0.0-beta.17` or higher.
- [Node.js](https://nodejs.org/) `v22` or higher.

Setup for Claude Desktop in `claude_desktop_config.json` as below:

```json
{
  "mcpServers": {
    "frame0-mcp-server": {
      "command": "npx",
      "args": ["-y", "frame0-mcp-server"]
    }
  }
}
```

You can use `--api-port=<port>` optional parameter to use another port number for Frame0's API server.

## Example Prompts

- _“Create a login screen for Phone in Frame0”_
- _“Create a Instagram home screen for Phone in Frame0”_
- _“Create a Netflix home screen for TV in Frame0”_
- _“Change the color of the Login button”_
- _“Remove the Twitter social login”_
- _“Replace the emojis by icons”_
- _“Set a link from the google login button to the Google website”_

## Tools

- `create_frame`
- `create_rectangle`
- `create_ellipse`
- `create_text`
- `create_line`
- `create_connector`
- `create_icon`
- `create_image`
- `update_shape`
- `duplicate_shape`
- `delete_shape`
- `get_available_icons` (supports optional `search` parameter to filter icons by name or tag)
- `move_shape`
- `align_shapes`
- `group`
- `ungroup`
- `set_link`
- `export_shape_as_image`
- `add_page`
- `update_page`
- `duplicate_page`
- `delete_page`
- `get_current_page_id`
- `set_current_page_by_id`
- `get_page`
- `get_all_pages`
- `export_page_as_image`

## Dev

1. Clone this repository.
2. Build with `npm run build`.
3. Update `claude_desktop_config.json` in Claude Desktop as below.
4. Restart Claude Desktop.

```json
{
  "mcpServers": {
    "frame0-mcp-server": {
      "command": "node",
      "args": ["<full-path-to>/frame0-mcp-server/build/index.js"]
    }
  }
}
```
