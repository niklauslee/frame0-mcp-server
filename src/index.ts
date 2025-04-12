import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { executeCommand, filterShape, textResult } from "./utils.js";

const AVAILABLE_COLORS_PROMPT = `The available colors are as follows:
$background, $foreground, $transparent, and the format $<color><level>.  
<color> is one of the following: gray, mauve, slate, sage, olive, sand, tomato, red, ruby, crimson, pink, plum, purple, violet, iris, indigo, blue, cyan, teal, jade, green, grass, bronze, gold, brown, orange, amber, yellow, lime, mint, sky.  
<level> is a value between 1 and 12. (1 is the lightest, and 12 is the darkest)`;

const NAME_DESC = `The name of the shape.`;
const LEFT_DESC = `The left coordinate of the shape in absolute coordinate system even inside the parent area.`;
const TOP_DESC = `The top coordinate of the shape in absolute coordinate system even inside the parent area.`;
const WIDTH_DESC = `The width of the shape.`;
const HEIGHT_DESC = `The height of the shape.`;

const PARENT_ID_DESC = `The parent ID of the shape.
- Typically a frame ID.
- Child shapes do not placed inside the parent shape. Just form a tree structure.
- All shapes are drawn in the same coordinate system regardless of parent-child relationships.
- If not provided, the shape will be created in the page.`;

const shapeSchema = {
  name: z.string().optional().describe(NAME_DESC),
  // parentId: z.string().optional().describe(PARENT_ID_DESC),
  left: z.number().optional().describe(LEFT_DESC),
  top: z.number().optional().describe(TOP_DESC),
  width: z.number().optional().describe(WIDTH_DESC),
  height: z.number().optional().describe(HEIGHT_DESC),
  fillColor: z
    .string()
    .optional()
    .describe(`Fill color of the shape. ${AVAILABLE_COLORS_PROMPT}`),
  strokeColor: z
    .string()
    .optional()
    .describe(`Stroke color of the shape. ${AVAILABLE_COLORS_PROMPT}`),
  fontColor: z
    .string()
    .optional()
    .describe(`Font color of the shape. ${AVAILABLE_COLORS_PROMPT}`),
  fontSize: z.number().optional().describe("Font size of the text."),
  corners: z
    .array(z.number())
    .optional()
    .describe(
      "Corner radius of the shape. Must be an array of 4 numbers: [left-top, right-top, right-bottom, left-bottom]."
    ),
  text: z.string().optional().describe("Text content of the shape"),
  // wordWrap: z
  //   .boolean()
  //   .optional()
  //   .default(false)
  //   .describe(
  //     "Whether to wrap the text inside the shape. If true, the text will be wrapped to fit the width of the shape."
  //   ),
  // horzAlign: z
  //   .enum(["left", "center", "right"])
  //   .optional()
  //   .describe("Horizontal alignment of the text inside the shape."),
  // vertAlign: z
  //   .enum(["top", "middle", "bottom"])
  //   .optional()
  //   .describe("Vertical alignment of the text inside the shape."),
};

// Create an MCP server
const server = new McpServer({
  name: "frame0-mcp-server",
  version: "1.0.0",
});

server.tool(
  "create_frame",
  `Create a frame shape in Frame0.

1. Frame Types and Sizes
Typical size of frames:
- Phone: 320 x 690
- Tablet: 520 x 790
- Desktop: 800 x 600
- Browser: 800 x 600
- Watch: 198 x 242
- TV: 960 x 570

2. Frame Structure
- When you create a screen, you need to create a frame first.
- The frame is the parent of all UI elements in the screen.

3. UI elements in the frame
- Find appropriate UI elements first. If there is no suitable UI element, 
create it using a rectangle, ellipse, text, line, or icon. 

4. Coordinate System
The frame and the child shapes inside it use the same absolute coordinate system.
For example, if the frame is located at [100, 100] and its size is 320x690,
then the position and size of all shapes inside the frame must not exceed the 
area from [100, 100] to [420, 790] in the absolute coordinate system.
`,
  {
    frameType: z
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
    left: z.number().describe(LEFT_DESC),
    top: z.number().describe(TOP_DESC),
    width: z.number().describe(WIDTH_DESC),
    height: z.number().describe(HEIGHT_DESC),
    fillColor: z
      .string()
      .optional()
      .describe(`Fill color of the frame. ${AVAILABLE_COLORS_PROMPT}`),
  },
  async ({ frameType, left, top, width, height, fillColor }) => {
    try {
      const shapeId = await executeCommand(
        "shape:create-shape-from-library-by-query",
        {
          query: `${frameType}&@Frame`,
          shapeProps: {
            left,
            top,
            width,
            height,
            fillColor,
          },
        }
      );
      await executeCommand("view:fit-to-screen");
      const data = await executeCommand("shape:get-shape", {
        shapeId,
      });
      return textResult("Created frame: " + JSON.stringify(filterShape(data)));
    } catch (error) {
      console.error(error);
      return textResult(`Failed to create frame: ${error}`);
    }
  }
);

// server.tool(
//   "create_element",
//   `Create an UI element shape in Frame0.

// Create a UI element as a priority, and if there is no suitable UI element,
// create it using a rectangle, ellipse, text, line, or icon.
//   `,
//   {
//     elementType: z
//       .enum([
//         "Panel",
//         "Input",
//         "Select",
//         "Combobox",
//         "Radio",
//         "Checkbox",
//         "Switch",
//         "Text Area",
//         "Button",
//         "Button (primary)",
//         "Button (secondary)",
//       ])
//       .describe("Type of the UI element"),
//     parentId: z
//       .string()
//       .optional()
//       .describe(
//         PARENT_ID_DESC
//       ),
//     left: z.number().describe("left coordinate of the UI element"),
//     top: z.number().describe("top coordinate of the UI element"),
//     width: z.number().optional().describe("Width of the UI element"),
//     height: z.number().optional().describe("Height of the UI element"),
//     text: z.string().optional().describe("Text content of the UI element"),
//   },
//   async ({ elementType, parentId, left, top, width, height, text }) => {
//     try {
//       const shapeId = await executeCommand(
//         "shape:create-shape-from-library-by-query",
//         {
//           query: `${elementType}`,
//           shapeProps: {
//             left,
//             top,
//             width,
//             height,
//             text,
//           },
//           parentId,
//         }
//       );
//       const data = await executeCommand("shape:get-shape", {
//         shapeId,
//       });
//       return textResult(
//         "Created element: " + JSON.stringify(filterShape(data))
//       );
//     } catch (error) {
//       console.error(error);
//       return textResult(`Failed to create element: ${error}`);
//     }
//   }
// );

server.tool(
  "create_rectangle",
  `Create a rectangle shape in Frame0.`,
  {
    name: z.string().optional().describe(NAME_DESC),
    parentId: z.string().optional().describe(PARENT_ID_DESC),
    left: z.number().describe(LEFT_DESC),
    top: z.number().describe(TOP_DESC),
    width: z.number().describe(WIDTH_DESC),
    height: z.number().describe(HEIGHT_DESC),
    fillColor: z
      .string()
      .optional()
      .describe(`Fill color of the rectangle. ${AVAILABLE_COLORS_PROMPT}`),
    strokeColor: z
      .string()
      .optional()
      .describe(`Stroke color of the rectangle. ${AVAILABLE_COLORS_PROMPT}`),
    corners: z
      .array(z.number())
      .optional()
      .describe(
        "Corner radius of the rectangle. Must be an array of 4 numbers: [left-top, right-top, right-bottom, left-bottom]."
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
          fillColor,
          strokeColor,
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
    name: z.string().optional().describe(NAME_DESC),
    parentId: z.string().optional().describe(PARENT_ID_DESC),
    left: z.number().describe(LEFT_DESC),
    top: z.number().describe(TOP_DESC),
    width: z.number().describe(WIDTH_DESC),
    height: z.number().describe(HEIGHT_DESC),
    fillColor: z
      .string()
      .optional()
      .describe(`Fill color of the ellipse. ${AVAILABLE_COLORS_PROMPT}`),
    strokeColor: z
      .string()
      .optional()
      .describe(`Stroke color of the ellipse. ${AVAILABLE_COLORS_PROMPT}`),
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
          fillColor,
          strokeColor,
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
  `Create a text shape in Frame0.  

- Text can be used to create labels, links, descriptions, paragraph, headings, etc.
- Text is plain text without formatting. Therefore, rich text cannot be used, and HTML or CSS styles are not allowed.
- Text position need to be adjusted using 'move_shape()' tool based on the width and height of the created text.
`,
  {
    name: z.string().optional().describe(NAME_DESC),
    parentId: z.string().optional().describe(PARENT_ID_DESC),
    left: z.number().describe(LEFT_DESC),
    top: z.number().describe(TOP_DESC),
    // width: z
    //   .number()
    //   .optional()
    //   .describe(
    //     "Optional width of the text. If you provide width, the text will be wrapped to fit the width."
    //   ),
    text: z
      .string()
      .describe(
        "Text to display. Use newline character (0x0A) instead of '\\n' for new line."
      ),
    // textAlignment: z
    //   .enum(["left", "center", "right"])
    //   .optional()
    //   .default("left")
    //   .describe("Text alignment of the text."),
    fontColor: z
      .string()
      .optional()
      .describe(`Font color of the text. ${AVAILABLE_COLORS_PROMPT}`),
    fontSize: z.number().optional().describe("Font size of the text."),
  },
  async ({
    name,
    parentId,
    left,
    top,
    // width,
    text,
    // textAlignment,
    fontColor,
    fontSize,
  }) => {
    try {
      const shapeId = await executeCommand("shape:create-shape", {
        type: "Text",
        shapeProps: {
          name,
          left,
          // width,
          top,
          text,
          // horzAlign: textAlignment,
          fontColor,
          fontSize,
          // wordWrap: typeof width === "number" ? true : false,
        },
        parentId,
      });
      const data = await executeCommand("shape:get-shape", {
        shapeId,
      });
      return textResult("Created text: " + JSON.stringify(filterShape(data)));
    } catch (error) {
      console.error(error);
      return textResult(`Failed to create text: ${error}`);
    }
  }
);

server.tool(
  "create_line",
  `Create a multi-point line shape in Frame0.
  A line can be used to create a line, arrow, a polyline, or a polygon.
  If first point and last point are the same, it will be a polygon.`,
  {
    name: z.string().optional().describe("Optional name of the line."),
    parentId: z.string().optional().describe(PARENT_ID_DESC),
    points: z
      .array(z.tuple([z.number(), z.number()]))
      .describe("Array of points. At least 2 points are required."),
    fillColor: z
      .string()
      .optional()
      .describe(`Fill color of the line. ${AVAILABLE_COLORS_PROMPT}`),
    strokeColor: z
      .string()
      .optional()
      .describe(`Stroke color of the line. ${AVAILABLE_COLORS_PROMPT}`),
  },
  async ({ name, parentId, points, fillColor, strokeColor }) => {
    try {
      const shapeId = await executeCommand("shape:create-shape", {
        type: "Line",
        shapeProps: {
          name,
          path: points,
          fillColor,
          strokeColor,
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
  `Create an icon shape in Frame0.

Typical size of icons:
- Medium: 24 x 24
- Small: 16 x 16
- Large: 32 x 32
`,
  {
    name: z.string().describe(NAME_DESC),
    parentId: z.string().optional().describe(PARENT_ID_DESC),
    left: z.number().describe(LEFT_DESC),
    top: z.number().describe(TOP_DESC),
    width: z.number().describe(WIDTH_DESC),
    height: z.number().describe(HEIGHT_DESC),
    strokeColor: z
      .string()
      .optional()
      .describe(`Stroke color of the icon. ${AVAILABLE_COLORS_PROMPT}`),
  },
  async ({ name, parentId, left, top, width, height, strokeColor }) => {
    try {
      const shapeId = await executeCommand("shape:create-icon", {
        iconName: name,
        shapeProps: {
          left,
          top,
          width,
          height,
          strokeColor,
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
  `Update properties of a shape in Frame0.`,
  { shapeId: z.string(), ...shapeSchema },
  async ({ shapeId, ...others }) => {
    try {
      const updatedId = await executeCommand("shape:update-shape", {
        shapeId,
        shapeProps: {
          ...others,
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
  `Delete a shape in Frame0.`,
  { shapeId: z.string().describe("Shape ID to delete") },
  async ({ shapeId, ...others }) => {
    try {
      await executeCommand("shape:update-shape", {
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
  `Get available icon shapes in Frame0.`,
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
  `Move a shape in Frame0.`,
  {
    shapeId: z.string().describe("Shape ID to move"),
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

// Define design screen prompt
// server.prompt(
//   "design_screen",
//   "Best practices for design a screen with Frame0",
//   { screen: z.string() },
//   ({ screen }) => {
//     return {
//       messages: [
//         {
//           role: "assistant",
//           content: {
//             type: "text",
//             text: `When design a screen with Frame0, follow these best practices:

// 1. Create a frame:
//    - First use create_frame()
//    - Set the frame type (e.g., Phone, Tablet, Desktop)
//    - Set the position (left, top) of the frame
//    - Remember the resulting frame's properties (id, position, width, height) for future reference

// 2. Shape Creation:
//    - Use create_rectangle() for containers and input fields
//    - Use create_text() for labels, buttons text, and links
//    - Set the position (left, top) and size (width, height) of each shape based on the frame
// `,
//           },
//         },
//       ],
//       description:
//         "Best practices for design wireframe for a screen with Frame0",
//     };
//   }
// );

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Weather MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Error starting server:", error);
  process.exit(1);
});
