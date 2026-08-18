import os
import json
import time
from typing import Dict, Any, List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="Tech Manthan 6.0 - Biometric Portal Reveal",
    description="Official Reveal System for Tech Manthan 6.0 | BCA, Dr. B.B. Hegde College",
    version="6.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active WebSocket connections for synchronized stage displays
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

# Data models
class PalmScanPayload(BaseModel):
    confidence: float
    landmarks_count: int = 21
    device_info: str = "WebCam Biometric Sensor"
    scan_duration_ms: float = 2000.0

# In-memory ceremony state
ceremony_state = {
    "status": "READY",
    "total_scans": 0,
    "revealed": False,
    "revealed_at": None,
    "portal_url": "https://tech.manthana.bbhegdecollege.com/home.html",
    "theme": {
        "event_name": "TECH MANTHAN 6.0",
        "college": "Dr. B.B. Hegde First Grade College, Kundapura",
        "department": "Department of Computer Applications (BCA)",
        "motto": "DIVIDED BY ZERO, UNITED BY ONE",
        "primary_color": "#00f3ff",
        "secondary_color": "#bc13fe",
        "bg_color": "#030712"
    }
}

@app.get("/api/config")
async def get_config() -> Dict[str, Any]:
    """Return ceremony and event configuration."""
    return ceremony_state

@app.get("/api/status")
async def get_status() -> Dict[str, Any]:
    """Health and ceremony status."""
    return {
        "status": "SYS_ACTIVE",
        "server_time": time.time(),
        "total_scans": ceremony_state["total_scans"],
        "revealed": ceremony_state["revealed"]
    }

from fastapi.responses import FileResponse, JSONResponse, HTMLResponse
import urllib.request

@app.get("/api/proxy-home")
def proxy_home():
    """Proxy official Tech Manthan home page to strip X-Frame-Options and allow clean iframe rendering."""
    target_url = "https://tech.manthana.bbhegdecollege.com/home.html"
    req = urllib.request.Request(target_url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    })
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            html = response.read().decode('utf-8', errors='ignore')
            # Inject base tag so all relative CSS, JS, images resolve to official domain
            if '<head>' in html:
                html = html.replace('<head>', '<head><base href="https://tech.manthana.bbhegdecollege.com/">')
            elif '<HEAD>' in html:
                html = html.replace('<HEAD>', '<HEAD><base href="https://tech.manthana.bbhegdecollege.com/">')
            return HTMLResponse(content=html)
    except Exception as e:
        return HTMLResponse(content=f"<div style='background:#030712;color:#00f3ff;padding:40px;text-align:center;font-family:sans-serif;'><h2>TECH MANTHAN 6.0 OFFICIAL PORTAL</h2><p>Redirecting to official website...</p><script>window.location.href='https://tech.manthana.bbhegdecollege.com/home.html#events';</script></div>")

@app.post("/api/verify-palm")
async def verify_palm(payload: PalmScanPayload) -> Dict[str, Any]:
    """Process biometric palm scan telemetry and authenticate portal reveal."""
    ceremony_state["total_scans"] += 1
    ceremony_state["revealed"] = True
    ceremony_state["revealed_at"] = time.time()
    
    response = {
        "success": True,
        "auth_code": f"BCA-6.0-AUTH-{int(time.time()*1000)%1000000:06d}",
        "confidence": min(0.999, max(0.92, payload.confidence)),
        "message": "BIOMETRIC PALM SIGNATURE AUTHENTICATED // PORTAL UNLOCKED",
        "redirect_url": ceremony_state["portal_url"]
    }
    
    # Broadcast to all connected screens (e.g. stage projector & VIP tablet)
    await manager.broadcast({
        "event": "PORTAL_REVEALED",
        "data": response
    })
    
    return response

@app.post("/api/reset-ceremony")
async def reset_ceremony() -> Dict[str, Any]:
    """Reset reveal state for rehearsal or multiple guests."""
    ceremony_state["revealed"] = False
    ceremony_state["revealed_at"] = None
    await manager.broadcast({"event": "CEREMONY_RESET"})
    return {"status": "RESET_SUCCESS"}

@app.websocket("/ws/ceremony")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                if msg.get("action") == "TRIGGER_REVEAL":
                    ceremony_state["revealed"] = True
                    await manager.broadcast({
                        "event": "PORTAL_REVEALED",
                        "data": {
                            "success": True,
                            "auth_code": f"STAGE-OVERRIDE-{int(time.time()*1000)%1000000:06d}",
                            "message": "STAGE PROTOCOL OVERRIDE // REVEAL TRIGGERED",
                            "redirect_url": ceremony_state["portal_url"]
                        }
                    })
                elif msg.get("action") == "RESET":
                    ceremony_state["revealed"] = False
                    await manager.broadcast({"event": "CEREMONY_RESET"})
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Mount current directory for static assets
current_dir = os.path.dirname(os.path.abspath(__file__))

@app.get("/")
async def root():
    index_path = os.path.join(current_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return JSONResponse({"status": "Server active. Place index.html in directory."})

# Also serve direct root files like style.css, scanner.js, logo.png, etc.
@app.get("/{filename}")
async def serve_file(filename: str):
    file_path = os.path.join(current_dir, filename)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    return JSONResponse({"error": "File not found"}, status_code=404)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
