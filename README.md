# mcp-ctf-server

MCP server that exposes common CTF and cybersecurity tools so LLMs can help with challenges in a controlled lab environment.

This is meant for capture-the-flag games and training only. Use it on systems and data you own or have explicit permission to test.

## Features

Tools are grouped into categories and exposed as MCP tools:

- Crypto: `gf-complete`, `pari-gp`, `rsactftool`, `gmp-utils`
- Disk / file forensics: `bulk-extractor`, `sleuthkit`, `afflib-tools`, `scalpel`, `pdfid`, `poppler-utils`, `binutils-multiarch`
- Traffic forensics: `wireshark`, `tshark`, `tcpflow`, `tcpreplay`, `ngrep`, `dsniff`, `bro`, `suricata`
- Malware analysis: `yara`, `yara-rules`, `clamav`, `upx`, `radare2`
- Stego: `steghide`, `stegcracker`, `qpdf`, `sox`, `mediainfo`, `gifshuffle`
- Reverse engineering: `python3-capstone`, `python3-keystone`, `python3-unicorn`, `frida-tools`, `radare2`
- Pwn: `python3-pwntools`, `one-gadget`, `ropgadget`, `seccomp-tools`
- OSINT: `exifprobe`, `gdal-bin`
- Python CTF sandbox: short Python3 snippets with common CTF libraries installed

## Requirements

- Debian or Ubuntu style system with `apt`
- Internet access for installing packages
- `sudo` access
- Node.js and npm (installed automatically by `setup.sh` if missing)

## Quick start

Clone the repo and run the setup script:

```bash
git clone https://github.com/your-user/mcp-ctf-server.git
cd mcp-ctf-server
chmod +x setup.sh
./setup.sh
```

After it finishes, you can run the server with:

```bash
node dist/index.js
```

or

```bash
npm start
```

The server speaks MCP over stdio.

## MCP client configuration example

For a client that supports MCP configuration similar to Claude Desktop, you can add an entry like this in its config file:

```json
{
  "mcpServers": {
    "mcp-ctf-server": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-ctf-server/dist/index.js"],
      "env": {}
    }
  }
}
```

Restart the client after editing the config.

## Available tools

The server exposes these MCP tools:

- `crypto_tools`
- `disk_forensics_tools`
- `traffic_forensics_tools`
- `malware_analysis_tools`
- `stego_tools`
- `reverse_engineering_tools`
- `pwn_tools`
- `osint_tools`
- `python_ctf_sandbox`

Each category tool accepts:

```json
{
  "tool": "binary-name",
  "args": ["optional", "arguments"],
  "stdin": "optional stdin data",
  "cwd": "/path/to/challenge/files"
}
```

The Python sandbox accepts:

```json
{
  "code": "print('hello from ctf sandbox')",
  "cwd": "/path/to/challenge/files"
}
```

Exact wiring of tool calls depends on your MCP client, but the structures above show the shape of the arguments.

## Example calls

These examples show how an MCP client might call the tools. The actual format in your client UI may differ, but the arguments are the same.

### 1. Use `rsactftool` on a captured key file

Tool name: `crypto_tools`

Arguments:

```json
{
  "tool": "rsactftool",
  "args": ["--publickey", "public.pem"],
  "cwd": "/home/ctf/challs/rsa-easy"
}
```

### 2. Run `tshark` on a pcap

Tool name: `traffic_forensics_tools`

Arguments:

```json
{
  "tool": "tshark",
  "args": ["-r", "capture.pcap", "-Y", "http"],
  "cwd": "/home/ctf/challs/web-pcap"
}
```

### 3. Scan a binary with `radare2`

Tool name: `malware_analysis_tools`

Arguments:

```json
{
  "tool": "radare2",
  "args": ["-A", "suspicious.bin"],
  "cwd": "/home/ctf/challs/malware1"
}
```

### 4. Try `steghide` on a JPEG

Tool name: `stego_tools`

Arguments:

```json
{
  "tool": "steghide",
  "args": ["extract", "-sf", "hidden.jpg", "-p", ""]
}
```

### 5. Use the Python CTF sandbox with pwntools

Tool name: `python_ctf_sandbox`

Arguments:

```json
{
  "code": "from pwn import *\nprint(cyclic(32))"
}
```

The server will return combined stdout and stderr from the command or Python snippet.

## Safety

This server simply exposes local binaries over MCP. The LLM using it can run these tools with the permissions of the user account that starts the server. Run it only in CTF labs or sandboxes where this is acceptable.

Do not connect it to production systems or networks you do not control.
