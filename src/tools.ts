import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { spawn } from "node:child_process";
import { TextDecoder } from "node:util";

export interface CommandArgs {
  tool: string;
  args?: string[];
  stdin?: string;
  cwd?: string;
}

const decoder = new TextDecoder();

export async function runCommand(
  command: string,
  args: string[] = [],
  options: { cwd?: string; stdin?: string } = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd || process.cwd(),
      env: process.env
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", data => {
      stdout += decoder.decode(data);
    });

    child.stderr.on("data", data => {
      stderr += decoder.decode(data);
    });

    child.on("error", err => {
      reject(err);
    });

    child.on("close", code => {
      const result =
        `# Command\n` +
        `${command} ${args.join(" ")}\n\n` +
        `# Exit code\n${code}\n\n` +
        `# STDOUT\n${stdout || "<empty>"}\n\n` +
        `# STDERR\n${stderr || "<empty>"}\n`;
      resolve(result);
    });

    if (options.stdin) {
      child.stdin.write(options.stdin);
    }
    child.stdin.end();
  });
}

function makeTool(
  name: string,
  description: string,
  allowedTools: string[]
): Tool {
  return {
    name,
    description,
    inputSchema: {
      type: "object",
      required: ["tool"],
      properties: {
        tool: {
          type: "string",
          description: "Binary to run for this category.",
          enum: allowedTools
        },
        args: {
          type: "array",
          description: "Arguments to pass to the tool.",
          items: { type: "string" }
        },
        stdin: {
          type: "string",
          description: "Optional stdin content."
        },
        cwd: {
          type: "string",
          description: "Optional working directory."
        }
      }
    }
  };
}

export const cryptoTools = makeTool(
  "crypto_tools",
  "Run crypto-focused tools on CTF data.",
  ["gf-complete", "pari-gp", "rsactftool", "gmp-utils"]
);

export const diskForensicsTools = makeTool(
  "disk_forensics_tools",
  "Run disk and file forensics tools.",
  [
    "bulk-extractor",
    "sleuthkit",
    "afflib-tools",
    "scalpel",
    "pdfid",
    "poppler-utils",
    "binutils-multiarch"
  ]
);

export const trafficForensicsTools = makeTool(
  "traffic_forensics_tools",
  "Run traffic forensics tools on captures.",
  [
    "wireshark",
    "tshark",
    "tcpflow",
    "tcpreplay",
    "ngrep",
    "dsniff",
    "bro",
    "suricata"
  ]
);

export const malwareAnalysisTools = makeTool(
  "malware_analysis_tools",
  "Run malware analysis helpers on binaries.",
  ["yara", "yara-rules", "clamav", "upx", "radare2"]
);

export const stegoTools = makeTool(
  "stego_tools",
  "Run steganography and media tools.",
  ["steghide", "stegcracker", "qpdf", "sox", "mediainfo", "gifshuffle"]
);

export const reverseEngineeringTools = makeTool(
  "reverse_engineering_tools",
  "Run reverse engineering helpers.",
  [
    "python3-capstone",
    "python3-keystone",
    "python3-unicorn",
    "frida-tools",
    "radare2"
  ]
);

export const pwnTools = makeTool(
  "pwn_tools",
  "Run binary exploitation helpers.",
  ["python3-pwntools", "one-gadget", "ropgadget", "seccomp-tools"]
);

export const osintTools = makeTool(
  "osint_tools",
  "Run OSINT-style helpers on local data.",
  ["exifprobe", "gdal-bin"]
);

export const pythonCtfSandbox: Tool = {
  name: "python_ctf_sandbox",
  description:
    "Run short Python3 snippets using typical CTF libraries.",
  inputSchema: {
    type: "object",
    required: ["code"],
    properties: {
      code: {
        type: "string",
        description: "Python3 code to run."
      },
      cwd: {
        type: "string",
        description: "Optional working directory."
      }
    }
  }
};

export async function handleCategoryTool(
  categoryName: string,
  allowedTools: string[],
  args: CommandArgs
): Promise<string> {
  if (!allowedTools.includes(args.tool)) {
    throw new Error(
      `Tool "${args.tool}" not allowed for category "${categoryName}". Allowed: ${allowedTools.join(
        ", "
      )}`
    );
  }
  const cmdArgs = args.args || [];
  return await runCommand(args.tool, cmdArgs, {
    cwd: args.cwd,
    stdin: args.stdin
  });
}

export async function runPythonSandbox(
  code: string,
  cwd?: string
): Promise<string> {
  return await runCommand("python3", ["-"], {
    cwd,
    stdin: code
  });
}
