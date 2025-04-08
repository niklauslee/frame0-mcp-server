import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fetch from "node-fetch";

const URL = "http://localhost:3000";

const AVAILABLE_COLORS_PROMPT = `The available colors are as follows: $background, $foreground, and the format $<color><level>.  
<color> is one of the following: gray, mauve, slate, sage, olive, sand, tomato, red, ruby, crimson, pink, plum, purple, violet, iris, indigo, blue, cyan, teal, jade, green, grass, bronze, gold, brown, orange, amber, yellow, lime, mint, sky.  
<level> is a value between 1 and 12. (1 is the lightest, and 12 is the darkest)`;

const shapeSchema = {
  name: z.string().optional().describe("Name of the shape."),
  parentId: z
    .string()
    .optional()
    .describe("Parent ID of the shape. Typically the frame ID"),
  left: z.number().describe("left coordinate of the shape"),
  top: z.number().describe("top coordinate of the shape"),
  width: z.number().describe("Width of the shape"),
  height: z.number().describe("Height of the shape"),
  fillColor: z
    .string()
    .optional()
    .describe(
      `A palette color name for Fill color of the shape. ${AVAILABLE_COLORS_PROMPT}`
    ),
  strokeColor: z
    .string()
    .optional()
    .describe(
      `A palette color name for Stroke color of the shape. ${AVAILABLE_COLORS_PROMPT}`
    ),
  fontColor: z
    .string()
    .optional()
    .describe(
      `A palette color name for Font color of the shape. ${AVAILABLE_COLORS_PROMPT}`
    ),
  fontSize: z
    .number()
    .optional()
    .describe("Font size of the text. Base font size is 16px."),
  corners: z
    .array(z.number())
    .optional()
    .describe(
      "Corner radius of the shape. Must be an array of 4 numbers: [left-top, right-top, right-bottom, left-bottom]."
    ),
  text: z.string().optional().describe("Text inside the shape"),
  horzAlign: z
    .enum(["left", "center", "right"])
    .optional()
    .describe(
      "Horizontal alignment of the text inside the shape. Default is 'center'."
    ),
  vertAlign: z
    .enum(["top", "middle", "bottom"])
    .optional()
    .describe(
      "Vertical alignment of the text inside the shape. Default is 'middle'."
    ),
};

async function requestToFrame0(slug: string, params: any = {}) {
  const res = await fetch(`${URL}${slug}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error("Failed to create rectangle");
  }
  const data = await res.json();
  return data;
}

// Create an MCP server
const server = new McpServer({
  name: "frame0-mcp-server",
  version: "1.0.0",
});

server.tool(
  "create_frame",
  `Create a frame in Frame0.

  Typical size of frames:
  - Phone: 320 x 690
  - Tablet: 520 x 790
  - Desktop: 800 x 600
  - Browser: 800 x 600
  - Watch: 198 x 242
  - TV: 960 x 570.

  When you create a screen, you need to create a frame first.
  The frame is the parent of all UI elements in the screen.

  The coordinate system of the frame and the shapes inside it are the same. Just because they are inside doesn't mean they start at [0,0].
`,
  {
    name: z
      .enum([
        "Phone",
        "Tablet",
        "Desktop",
        "Browser",
        "Watch",
        "TV",
        "Custom Frame",
      ])
      .describe("Frame type"),
    left: z.number().describe("left coordinate of the frame"),
    top: z.number().describe("top coordinate of the frame"),
    width: z.number().describe("Width of the frame"),
    height: z.number().describe("Height of the frame"),
    fillColor: z
      .string()
      .optional()
      .describe(
        `A palette color name for Fill color of the frame. ${AVAILABLE_COLORS_PROMPT}`
      ),
  },
  async ({ name, left, top, width, height }) => {
    const data = await requestToFrame0("/create_shape_from_library", {
      query: `${name}&@Frame`,
      left,
      top,
      width,
      height,
    });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
        },
      ],
    };
  }
);

server.tool(
  "create_text",
  `Create a text in Frame0.
  
  Text can be used to create labels, links, descriptions, paragraph, headings, etc.`,
  {
    name: z.string().optional().describe("Name of the text"),
    parentId: z
      .string()
      .optional()
      .describe("Parent ID of the text. Typically the frame ID"),
    left: z.number().describe("left coordinate of the text"),
    top: z.number().describe("top coordinate of the text"),
    text: z.string().describe("Text to display"),
    fontColor: z
      .string()
      .optional()
      .describe(
        `A palette color name for Font color of the text. ${AVAILABLE_COLORS_PROMPT}`
      ),
    fontSize: z
      .number()
      .optional()
      .describe("Font size of the text. Base font size is 16px."),
  },
  async ({ name, parentId, left, top, text, fontColor }) => {
    const data = await requestToFrame0("/create_shape", {
      type: "Text",
      parentId,
      name,
      left,
      top,
      text,
      fontColor,
    });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
        },
      ],
    };
  }
);

server.tool(
  "create_rectangle",
  `Create a rectangle in Frame0.`,
  {
    name: z.string().optional().describe("Name of the rectangle."),
    parentId: z
      .string()
      .optional()
      .describe("Parent ID of the rectangle. Typically the frame ID"),
    left: z.number().describe("left coordinate of the rectangle"),
    top: z.number().describe("top coordinate of the rectangle"),
    width: z.number().describe("Width of the rectangle"),
    height: z.number().describe("Height of the rectangle"),
    fillColor: z
      .string()
      .optional()
      .describe(
        `A palette color name for Fill color of the rectangle. ${AVAILABLE_COLORS_PROMPT}`
      ),
    strokeColor: z
      .string()
      .optional()
      .describe(
        `A palette color name for Stroke color of the rectangle. ${AVAILABLE_COLORS_PROMPT}`
      ),
    fontColor: z
      .string()
      .optional()
      .describe(
        `A palette color name for Font color of the rectangle. ${AVAILABLE_COLORS_PROMPT}`
      ),
    fontSize: z
      .number()
      .optional()
      .describe("Font size of the text. Base font size is 16px."),
    corners: z
      .array(z.number())
      .optional()
      .describe(
        "Corner radius of the rectangle. Must be an array of 4 numbers: [left-top, right-top, right-bottom, left-bottom]."
      ),
    text: z.string().optional().describe("Text inside the rectangle"),
    horzAlign: z
      .enum(["left", "center", "right"])
      .optional()
      .describe(
        "Horizontal alignment of the text inside the rectangle. Default is 'center'."
      ),
    vertAlign: z
      .enum(["top", "middle", "bottom"])
      .optional()
      .describe(
        "Vertical alignment of the text inside the rectangle. Default is 'middle'."
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
    fontColor,
    fontSize,
    text,
    horzAlign,
    vertAlign,
    corners,
  }) => {
    const data = await requestToFrame0("/create_shape", {
      type: "Rectangle",
      name,
      parentId,
      left,
      top,
      width,
      height,
      fillColor,
      strokeColor,
      fontColor,
      fontSize,
      text,
      horzAlign,
      vertAlign,
      corners,
    });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
        },
      ],
    };
  }
);

server.tool(
  "update_shape",
  `Update a shape in Frame0.`,
  { id: z.string(), ...shapeSchema },
  async ({ id, ...others }) => {
    const data = await requestToFrame0("/update_shape", {
      id,
      ...others,
    });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
        },
      ],
    };
  }
);

// Define design screen prompt
server.prompt(
  "design_screen",
  "Best practices for design a screen with Frame0",
  { screen: z.string() },
  ({ screen }) => {
    return {
      messages: [
        {
          role: "assistant",
          content: {
            type: "text",
            text: `When design a screen with Frame0, follow these best practices:

1. Create a frame:
   - First use create_frame()
   - Set the frame type (e.g., Phone, Tablet, Desktop)
   - Set the position (left, top) of the frame
   - Remember the resulting frame's properties (id, position, width, height) for future reference

2. Shape Creation:
   - Use create_rectangle() for containers and input fields
   - Use create_text() for labels, buttons text, and links
   - Set the position (left, top) and size (width, height) of each shape based on the frame
`,
          },
        },
      ],
      description:
        "Best practices for design wireframe for a screen with Frame0",
    };
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
