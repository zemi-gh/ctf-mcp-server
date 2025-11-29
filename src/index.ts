#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequest,
  CallToolRequestSchema,
  ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

import {
  cryptoTools,
  diskForensicsTools,
  trafficForensicsTools,
  malwareAnalysisTools,
  stegoTools,
  reverseEngineeringTools,
  pwnTools,
  osintTools,
  pythonCtfSandbox,
  handleCategoryTool,
  runPythonSandbox,
  CommandArgs
} from "./tools.js";

const CRYPTO_ALLOWED = ["gf-complete", "pari-gp", "rsactftool", "gmp-utils"];
const DISK_ALLOWED = [
  "bulk-extractor",
  "sleuthkit",
  "afflib-tools",
  "scalpel",
  "pdfid",
  "poppler-utils",
  "binutils-multiarch"
];
const TRAFFIC_ALLOWED = [
  "wireshark",
  "tshark",
  "tcpflow",
  "tcpreplay",
  "ngrep",
  "dsniff",
  "bro",
  "suricata"
];
const MALWARE_ALLOWED = ["yara", "yara-rules", "clamav", "upx", "radare2"];
const STEGO_ALLOWED = [
  "steghide",
  "stegcracker",
  "qpdf",
  "sox",
  "mediainfo",
  "gifshuffle"
];
const RE_ALLOWED = [
  "python3-capstone",
  "python3-keystone",
  "python3-unicorn",
  "frida-tools",
  "radare2"
];
const PWN_ALLOWED = [
  "python3-pwntools",
  "one-gadget",
  "ropgadget",
  "seccomp-tools"
];
const OSINT_ALLOWED = ["exifprobe", "gdal-bin"];

const server = new Server(
  {
    name: "mcp-ctf-server",
    version: "0.1.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      cryptoTools,
      diskForensicsTools,
      trafficForensicsTools,
      malwareAnalysisTools,
      stegoTools,
      reverseEngineeringTools,
      pwnTools,
      osintTools,
      pythonCtfSandbox
    ]
  };
});

server.setRequestHandler(
  CallToolRequestSchema,
  async (request: CallToolRequest) => {
    try {
      const name = request.params.name;
      const argsRaw = (request.params.arguments ||
        {}) as unknown as Record<string, unknown>;

      const toCommandArgs = (input: Record<string, unknown>): CommandArgs => ({
        tool: String(input.tool),
        args: Array.isArray(input.args)
          ? input.args.map(a => String(a))
          : undefined,
        stdin:
          typeof input.stdin === "string" ? (input.stdin as string) : undefined,
        cwd: typeof input.cwd === "string" ? (input.cwd as string) : undefined
      });

      switch (name) {
        case "crypto_tools": {
          const result = await handleCategoryTool(
            "crypto_tools",
            CRYPTO_ALLOWED,
            toCommandArgs(argsRaw)
          );
          return { content: [{ type: "text", text: result }] };
        }
        case "disk_forensics_tools": {
          const result = await handleCategoryTool(
            "disk_forensics_tools",
            DISK_ALLOWED,
            toCommandArgs(argsRaw)
          );
          return { content: [{ type: "text", text: result }] };
        }
        case "traffic_forensics_tools": {
          const result = await handleCategoryTool(
            "traffic_forensics_tools",
            TRAFFIC_ALLOWED,
            toCommandArgs(argsRaw)
          );
          return { content: [{ type: "text", text: result }] };
        }
        case "malware_analysis_tools": {
          const result = await handleCategoryTool(
            "malware_analysis_tools",
            MALWARE_ALLOWED,
            toCommandArgs(argsRaw)
          );
          return { content: [{ type: "text", text: result }] };
        }
        case "stego_tools": {
          const result = await handleCategoryTool(
            "stego_tools",
            STEGO_ALLOWED,
            toCommandArgs(argsRaw)
          );
          return { content: [{ type: "text", text: result }] };
        }
        case "reverse_engineering_tools": {
          const result = await handleCategoryTool(
            "reverse_engineering_tools",
            RE_ALLOWED,
            toCommandArgs(argsRaw)
          );
          return { content: [{ type: "text", text: result }] };
        }
        case "pwn_tools": {
          const result = await handleCategoryTool(
            "pwn_tools",
            PWN_ALLOWED,
            toCommandArgs(argsRaw)
          );
          return { content: [{ type: "text", text: result }] };
        }
        case "osint_tools": {
          const result = await handleCategoryTool(
            "osint_tools",
            OSINT_ALLOWED,
            toCommandArgs(argsRaw)
          );
          return { content: [{ type: "text", text: result }] };
        }
        case "python_ctf_sandbox": {
          const code = String(argsRaw.code ?? "");
          const cwd =
            typeof argsRaw.cwd === "string" ? (argsRaw.cwd as string) : undefined;

          if (!code.trim()) {
            throw new Error("python_ctf_sandbox: 'code' is required.");
          }

          const result = await runPythonSandbox(code, cwd);
          return { content: [{ type: "text", text: result }] };
        }
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      console.error("Error executing tool:", error);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: error instanceof Error ? error.message : String(error)
            })
          }
        ]
      };
    }
  }
);

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("mcp-ctf-server running on stdio");
}

runServer().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
