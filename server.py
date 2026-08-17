#!/usr/bin/env python3
"""
Tech Manthan 6.0 - Web Server & Ceremony Launcher
Dr. B.B. Hegde First Grade College, Kundapura
Department of Computer Applications (BCA)
"""

import sys
import os
import webbrowser
import socket
from threading import Timer

def find_free_port(start_port=8000):
    port = start_port
    while port < 65535:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(('localhost', port)) != 0:
                return port
            port += 1
    return start_port

def open_browser(url):
    print(f"\n[+] Opening Tech Manthan 6.0 Reveal Experience at: {url}")
    webbrowser.open(url)

def main():
    print("=" * 65)
    print("   TECH MANTHAN 6.0 - BIOMETRIC PALM REVEAL SYSTEM")
    print("   Dr. B.B. Hegde First Grade College, Kundapura")
    print("   Department of Computer Applications (BCA)")
    print("   Divided by Zero, United by One")
    print("=" * 65)

    current_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(current_dir)

    port = find_free_port(8000)
    url = f"http://localhost:{port}"

    # Schedule browser opening after server startup
    Timer(1.2, open_browser, args=[url]).start()

    try:
        import uvicorn
        print(f"\n[*] Launching FastAPI + Uvicorn server on port {port}...")
        uvicorn.run("app:app", host="0.0.0.0", port=port, log_level="info")
    except ImportError:
        print(f"\n[*] Uvicorn not found. Launching Python Standard HTTP Server on port {port}...")
        import http.server
        import socketserver

        Handler = http.server.SimpleHTTPRequestHandler
        Handler.extensions_map.update({
            '.wasm': 'application/wasm',
            '.js': 'application/javascript',
        })

        with socketserver.TCPServer(("", port), Handler) as httpd:
            print(f"[*] Serving Tech Manthan 6.0 at {url}")
            print("[*] Press Ctrl+C to terminate the server.\n")
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                print("\n[+] Server stopped successfully.")

if __name__ == "__main__":
    main()
