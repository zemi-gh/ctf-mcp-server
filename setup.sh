#!/usr/bin/env bash
set -euo pipefail

echo "[*] Updating apt package lists..."
sudo apt-get update

echo "[*] Installing CTF tools..."

sudo apt-get install -y       gf-complete       pari-gp       rsactftool       gmp-utils

sudo apt-get install -y       bulk-extractor       sleuthkit       afflib-tools       scalpel       pdfid       poppler-utils       binutils-multiarch

sudo apt-get install -y       wireshark       tshark       tcpflow       tcpreplay       ngrep       dsniff       bro       suricata

sudo apt-get install -y       yara       yara-rules       clamav       upx       radare2

sudo apt-get install -y       steghide       stegcracker       qpdf       sox       mediainfo       gifshuffle

sudo apt-get install -y       python3-capstone       python3-keystone       python3-unicorn       frida-tools       radare2

sudo apt-get install -y       python3-pwntools       one-gadget       ropgadget       seccomp-tools

sudo apt-get install -y       exifprobe       gdal-bin

sudo apt-get install -y       python3-requests       python3-magic       python3-pil       python3-sympy       python3-numpy       python3-scipy       python3-pycryptodome       python3-capstone       python3-keystone       python3-unicorn

echo "[*] Installing Node.js and npm if needed..."
if ! command -v node >/dev/null 2>&1; then
  sudo apt-get install -y nodejs npm
fi

echo "[*] Installing npm dependencies..."
npm install

echo "[*] Building MCP server..."
npm run build

echo "[*] Setup complete."
echo
echo "Run the server with:"
echo "  node dist/index.js"
