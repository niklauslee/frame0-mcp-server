import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  executeCommand,
  filterPage,
  filterShape,
  textResult,
} from "./utils.js";
import { colors, convertColor } from "./colors.js";

// Create an MCP server
const server = new McpServer({
  name: "frame0-mcp-server",
  version: "1.0.0",
});

server.tool(
  "create_frame",
  "Create a frame shape in Frame0.",
  {
    frameType: z
      .enum(["phone", "tablet", "desktop", "browser", "watch", "tv"])
      .describe("Type of the frame shape to create."),
    name: z.string().describe("Name of the frame shape."),
    left: z
      .number()
      .describe(
        "Left position of the frame shape in the absolute coordinate system. Typically (0, 0) position for the frame."
      ),
    top: z
      .number()
      .describe(
        "Top position of the frame shape in the absolute coordinate system. Typically (0, 0) position for the frame."
      ),
    fillColor: z
      .enum(colors)
      .optional()
      .describe("Background color of the frame shape."),
  },
  async ({ frameType, name, left, top, fillColor }) => {
    const FRAME_NAME = {
      phone: "Phone",
      tablet: "Tablet",
      desktop: "Desktop",
      browser: "Browser",
      watch: "Watch",
      tv: "TV",
    };
    const FRAME_SIZE = {
      phone: { width: 320, height: 690 },
      tablet: { width: 520, height: 790 },
      desktop: { width: 800, height: 600 },
      browser: { width: 800, height: 600 },
      watch: { width: 198, height: 242 },
      tv: { width: 960, height: 570 },
    };
    const FRAME_HEADER_HEIGHT = {
      phone: 0,
      tablet: 0,
      desktop: 32,
      browser: 76,
      watch: 0,
      tv: 0,
    };
    try {
      // frame headers should be consider to calculate actual content area
      const frameHeaderHeight = FRAME_HEADER_HEIGHT[frameType];
      const frameSize = FRAME_SIZE[frameType];
      const frameName = FRAME_NAME[frameType];
      const shapeId = await executeCommand(
        "shape:create-shape-from-library-by-query",
        {
          query: `${frameName}&@Frame`,
          shapeProps: {
            name,
            left,
            top: top - frameHeaderHeight,
            width: frameSize.width,
            height: frameSize.height + frameHeaderHeight,
            fillColor: convertColor(fillColor),
          },
        }
      );
      await executeCommand("view:fit-to-screen");
      const data = await executeCommand("shape:get-shape", {
        shapeId,
      });
      return textResult(
        "Created frame: " +
          JSON.stringify({
            ...filterShape(data),
            top: top - frameHeaderHeight,
            height: frameSize.height + frameHeaderHeight,
          })
      );
    } catch (error) {
      console.error(error);
      return textResult(`Failed to create frame: ${error}`);
    }
  }
);

server.tool(
  "create_rectangle",
  `Create a rectangle shape in Frame0.`,
  {
    name: z.string().describe("Name of the rectangle shape."),
    parentId: z
      .string()
      .optional()
      .describe("ID of the parent shape. Typically a frame ID."),
    left: z
      .number()
      .describe(
        "Left position of the rectangle shape in the absolute coordinate system."
      ),
    top: z
      .number()
      .describe(
        "Left position of the rectangle shape in the absolute coordinate system."
      ),
    width: z.number().describe("Width of the rectangle shape."),
    height: z.number().describe("Height of the rectangle shape."),
    fillColor: z
      .enum(colors)
      .optional()
      .describe("Fill color of the rectangle shape."),
    strokeColor: z
      .enum(colors)
      .optional()
      .describe("Stroke color of the rectangle shape."),
    corners: z
      .array(z.number())
      .length(4)
      .optional()
      .describe(
        "Corner radius of the rectangle shape. Must be in the form of [left-top, right-top, right-bottom, left-bottom]."
      ),
  },
  async ({
    name,
    parentId,
    left,
    top,
    width,
    height,
    fillColor,
    strokeColor,
    corners,
  }) => {
    try {
      const shapeId = await executeCommand("shape:create-shape", {
        type: "Rectangle",
        shapeProps: {
          name,
          left,
          top,
          width,
          height,
          fillColor: convertColor(fillColor),
          strokeColor: convertColor(strokeColor),
          corners,
        },
        parentId,
      });
      const data = await executeCommand("shape:get-shape", {
        shapeId,
      });
      return textResult(
        "Created rectangle: " + JSON.stringify(filterShape(data))
      );
    } catch (error) {
      console.error(error);
      return textResult(`Failed to create rectangle: ${error}`);
    }
  }
);

server.tool(
  "create_ellipse",
  `Create an ellipse shape in Frame0.`,
  {
    name: z.string().describe("Name of the ellipse shape."),
    parentId: z
      .string()
      .optional()
      .describe("ID of the parent shape. Typically a frame ID."),
    left: z
      .number()
      .describe(
        "Left position of the ellipse shape in the absolute coordinate system."
      ),
    top: z
      .number()
      .describe(
        "Top position of the ellipse shape in the absolute coordinate system."
      ),
    width: z.number().describe("Width of the ellipse shape."),
    height: z.number().describe("Height of the ellipse shape."),
    fillColor: z
      .enum(colors)
      .optional()
      .describe("Fill color of the ellipse shape."),
    strokeColor: z
      .enum(colors)
      .optional()
      .describe("Stroke color of the ellipse shape."),
  },
  async ({
    name,
    parentId,
    left,
    top,
    width,
    height,
    fillColor,
    strokeColor,
  }) => {
    try {
      const shapeId = await executeCommand("shape:create-shape", {
        type: "Ellipse",
        shapeProps: {
          name,
          left,
          top,
          width,
          height,
          fillColor: convertColor(fillColor),
          strokeColor: convertColor(strokeColor),
        },
        parentId,
      });
      const data = await executeCommand("shape:get-shape", {
        shapeId,
      });
      return textResult(
        "Created ellipse: " + JSON.stringify(filterShape(data))
      );
    } catch (error) {
      console.error(error);
      return textResult(`Failed to create ellipse: ${error}`);
    }
  }
);

server.tool(
  "create_text",
  "Create a text shape in Frame0.",
  {
    type: z
      .enum(["label", "paragraph", "heading", "link", "normal"])
      .optional()
      .describe(
        "Type of the text shape to create. If type is 'paragraph', text width need to be updated using 'update_shape' tool."
      ),
    name: z.string().describe("Name of the text shape."),
    parentId: z
      .string()
      .optional()
      .describe("ID of the parent shape. Typically a frame ID."),
    left: z
      .number()
      .describe(
        "Left position of the text shape in the absolute coordinate system. Position need to be adjusted using 'move_shape' tool based on the width and height of the created text."
      ),
    top: z
      .number()
      .describe(
        "Top position of the text shape in the absolute coordinate system.  Position need to be adjusted using 'move_shape' tool based on the width and height of the created text."
      ),
    width: z
      .number()
      .optional()
      .describe(
        "Width of the text shape. if the type is 'paragraph' recommend to set width."
      ),
    text: z
      .string()
      .describe(
        "Plain text content to display of the text shape. Use newline character (0x0A) instead of '\\n' for new line. Dont's use HTML and CSS code in the text content."
      ),
    fontColor: z
      .enum(colors)
      .optional()
      .describe("Font color of the text shape."),
    fontSize: z.number().optional().describe("Font size of the text shape."),
  },
  async ({
    type,
    name,
    parentId,
    left,
    top,
    width,
    text,
    fontColor,
    fontSize,
  }) => {
    try {
      const shapeId = await executeCommand("shape:create-shape", {
        type: "Text",
        shapeProps: {
          name,
          left,
          width,
          top,
          text,
          fontColor: convertColor(fontColor),
          fontSize,
          wordWrap: type === "paragraph",
        },
        parentId,
      });
      const data = await executeCommand("shape:get-shape", {
        shapeId,
      });
      return textResult(
        "Created text: " +
          JSON.stringify({ ...filterShape(data), textType: type })
      );
    } catch (error) {
      console.error(error);
      return textResult(`Failed to create text: ${error}`);
    }
  }
);

server.tool(
  "create_line",
  "Create a polyline shape in Frame0.",
  {
    name: z.string().describe("Name of the line shape."),
    parentId: z
      .string()
      .optional()
      .describe("ID of the parent shape. Typically a frame ID."),
    points: z
      .array(z.tuple([z.number(), z.number()]))
      .min(2)
      .describe(
        "Array of points of the line shape. At least 2 points are required. If first point and last point are the same, it will be a polygon."
      ),
    fillColor: z
      .enum(colors)
      .optional()
      .describe("Fill color of the line shape."),
    strokeColor: z
      .enum(colors)
      .optional()
      .describe("Stroke color of the line. shape"),
  },
  async ({ name, parentId, points, fillColor, strokeColor }) => {
    try {
      const shapeId = await executeCommand("shape:create-shape", {
        type: "Line",
        shapeProps: {
          name,
          path: points,
          fillColor: convertColor(fillColor),
          strokeColor: convertColor(strokeColor),
        },
        parentId,
      });
      const data = await executeCommand("shape:get-shape", {
        shapeId,
      });
      return textResult("Created line: " + JSON.stringify(filterShape(data)));
    } catch (error) {
      console.error(error);
      return textResult(`Failed to create line: ${error}`);
    }
  }
);

server.tool(
  "create_icon",
  "Create an icon shape in Frame0.",
  {
    name: z
      .string()
      .describe(
        "The name of the icon shape to create. The name should be one of the result of 'get_available_icons' tool."
      ),
    parentId: z
      .string()
      .optional()
      .describe("ID of the parent shape. Typically a frame ID."),
    left: z
      .number()
      .describe(
        "Left position of the icon shape in the absolute coordinate system."
      ),
    top: z
      .number()
      .describe(
        "Top position of the icon shape in the absolute coordinate system."
      ),
    size: z
      .enum(["small", "medium", "large", "extra-large"])
      .describe(
        "Size of the icon shape. 'small' is 16 x 16, 'medium' is 24 x 24, 'large' is 32 x 32, 'extra-large' is 48 x 48."
      ),
    strokeColor: z
      .enum(colors)
      .optional()
      .describe(`Stroke color of the icon shape.`),
  },
  async ({ name, parentId, left, top, size, strokeColor }) => {
    try {
      const sizeValue = {
        small: 16,
        medium: 24,
        large: 32,
        "extra-large": 48,
      }[size];
      const shapeId = await executeCommand("shape:create-icon", {
        iconName: name,
        shapeProps: {
          left,
          top,
          width: sizeValue ?? 24,
          height: sizeValue ?? 24,
          strokeColor: convertColor(strokeColor),
        },
        parentId,
      });
      const data = await executeCommand("shape:get-shape", {
        shapeId,
      });
      return textResult("Created icon: " + JSON.stringify(filterShape(data)));
    } catch (error) {
      console.error(error);
      return textResult(`Failed to create icon: ${error}`);
    }
  }
);

server.tool(
  "update_shape",
  "Update properties of a shape in Frame0.",
  {
    shapeId: z.string().describe("ID of the shape to update"),
    name: z.string().optional().describe("Name of the shape."),
    width: z.number().optional().describe("Width of the shape."),
    height: z.number().optional().describe("Height of the shape."),
    fillColor: z.enum(colors).optional().describe("Fill color of the shape."),
    strokeColor: z
      .enum(colors)
      .optional()
      .describe("Stroke color of the shape."),
    fontColor: z
      .enum(colors)
      .optional()
      .describe("Font color of the text shape."),
    fontSize: z.number().optional().describe("Font size of the text shape."),
    corners: z
      .array(z.number())
      .length(4)
      .optional()
      .describe(
        "Corner radius of the rectangle shape. Must be in the form of [left-top, right-top, right-bottom, left-bottom]."
      ),
    text: z
      .string()
      .optional()
      .describe(
        "Plain text content to display of the text shape. Don't include escape sequences and HTML and CSS code in the text content."
      ),
  },
  async ({
    shapeId,
    name,
    width,
    height,
    strokeColor,
    fillColor,
    fontColor,
    fontSize,
    corners,
  }) => {
    try {
      const updatedId = await executeCommand("shape:update-shape", {
        shapeId,
        shapeProps: {
          name,
          width,
          height,
          fillColor: convertColor(fillColor),
          strokeColor: convertColor(strokeColor),
          fontColor: convertColor(fontColor),
          fontSize,
          corners,
        },
      });
      const data = await executeCommand("shape:get-shape", {
        shapeId: updatedId,
      });
      return textResult("Updated shape: " + JSON.stringify(filterShape(data)));
    } catch (error) {
      console.error(error);
      return textResult(`Failed to update shape: ${error}`);
    }
  }
);

server.tool(
  "delete_shape",
  "Delete a shape in Frame0.",
  { shapeId: z.string().describe("ID of the shape to delete") },
  async ({ shapeId }) => {
    try {
      await executeCommand("edit:delete", {
        shapeIdArray: [shapeId],
      });
      return textResult("Deleted shape of id: " + shapeId);
    } catch (error) {
      console.error(error);
      return textResult(`Failed to delete shape: ${error}`);
    }
  }
);

server.tool(
  "get_available_icons",
  "Get available icon shapes in Frame0.",
  {},
  async ({}) => {
    try {
      const data = await executeCommand("shape:get-available-icons", {});
      return textResult("Available icons: " + JSON.stringify(data));
    } catch (error) {
      console.error(error);
      return textResult(`Failed to get available icons: ${error}`);
    }
  }
);

server.tool(
  "move_shape",
  "Move a shape in Frame0.",
  {
    shapeId: z.string().describe("ID of the shape to move"),
    dx: z.number().describe("Delta X"),
    dy: z.number().describe("Delta Y"),
  },
  async ({ shapeId, dx, dy }) => {
    try {
      await executeCommand("shape:move", {
        shapeId,
        dx,
        dy,
      });
      return textResult(`Moved shape (id: ${shapeId}) as (${dx}, ${dy})`);
    } catch (error) {
      console.error(error);
      return textResult(`Failed to get available icons: ${error}`);
    }
  }
);

server.tool(
  "add_page",
  "Add a new page in Frame0. Must add a new page first when you create a new frame. The added page becomes the current page.",
  {
    name: z.string().describe("Name of the page to add."),
  },
  async ({ name }) => {
    try {
      const pageData = await executeCommand("page:add", {
        pageProps: { name },
      });
      return textResult(`Added page: ${JSON.stringify(pageData)}`);
    } catch (error) {
      console.error(error);
      return textResult(`Failed to add new page: ${error}`);
    }
  }
);

server.tool(
  "get_current_page_id",
  "Get ID of the current page in Frame0.",
  {},
  async () => {
    try {
      const pageId = await executeCommand("page:get-current-page");
      return textResult(`Current page ID is ${pageId},`);
    } catch (error) {
      console.error(error);
      return textResult(`Failed to get current page: ${error}`);
    }
  }
);

server.tool(
  "set_current_page_by_id",
  "Set current page by ID in Frame0.",
  {
    pageId: z.string().describe("ID of the page to set as current page."),
  },
  async ({ pageId }) => {
    try {
      await executeCommand("page:set-current-page", {
        pageId,
      });
      return textResult(`Current page ID is ${pageId}`);
    } catch (error) {
      console.error(error);
      return textResult(`Failed to set current page: ${error}`);
    }
  }
);

server.tool(
  "get_page",
  "Get page data in Frame0.",
  {
    pageId: z
      .string()
      .optional()
      .describe(
        "ID of the page to get data. If not provided, the current page data is returned."
      ),
    exportShapes: z
      .boolean()
      .optional()
      .default(true)
      .describe("Export shapes data included in the page."),
  },
  async ({ pageId, exportShapes }) => {
    try {
      const pageData = await executeCommand("page:get", {
        pageId,
        exportShapes,
      });
      return textResult(
        `The page data: ${JSON.stringify(filterPage(pageData))}`
      );
    } catch (error) {
      console.error(error);
      return textResult(`Failed to get page data: ${error}`);
    }
  }
);

server.tool(
  "get_all_pages",
  "Get all pages data in Frame0.",
  {
    exportShapes: z
      .boolean()
      .optional()
      .default(false)
      .describe("Export shapes data included in the page data."),
  },
  async ({ exportShapes }) => {
    try {
      const docData = await executeCommand("doc:get", {
        exportPages: true,
        exportShapes,
      });
      // return textResult(`The all pages data: ${JSON.stringify(docData)}`);
      if (!Array.isArray(docData.children)) docData.children = [];
      const pageArray = docData.children.map((page: any) => filterPage(page));
      return textResult(`The all pages data: ${JSON.stringify(pageArray)}`);
    } catch (error) {
      console.error(error);
      return textResult(`Failed to get page data: ${error}`);
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Weather MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Error starting server:", error);
  process.exit(1);
});
