"""Real-time traffic monitoring with actual request metrics"""
from fastapi import Request
from datetime import datetime, timezone
import time
from collections import deque
from threading import Lock

class RealTrafficMonitor:
    def __init__(self):
        self.requests = deque(maxlen=1000)
        self.lock = Lock()
        self.stats = {
            "total_requests": 0,
            "by_endpoint": {},
            "by_method": {},
            "by_status": {},
            "active_users": set()
        }
    
    async def log_request(self, request: Request, response_time_ms: float, status_code: int):
        with self.lock:
            event = {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "method": request.method,
                "path": request.url.path,
                "status": status_code,
                "duration_ms": response_time_ms,
                "user_agent": request.headers.get("user-agent", "")[:100]
            }
            
            self.requests.append(event)
            self.stats["total_requests"] += 1
            self.stats["by_endpoint"][event["path"]] = self.stats["by_endpoint"].get(event["path"], 0) + 1
            self.stats["by_method"][event["method"]] = self.stats["by_method"].get(event["method"], 0) + 1
            self.stats["by_status"][status_code] = self.stats["by_status"].get(status_code, 0) + 1
            
            # Track active users (simplified by IP)
            client_ip = request.client.host if request.client else "unknown"
            self.stats["active_users"].add(client_ip)
    
    def get_realtime_stats(self):
        with self.lock:
            now = time.time()
            recent = [r for r in self.requests if (now - datetime.fromisoformat(r["timestamp"]).timestamp()) < 60]
            
            rps = len(recent) / 60 if recent else 0
            avg_response = sum(r["duration_ms"] for r in recent) / len(recent) if recent else 0
            active_users = len(self.stats["active_users"])
            
            return {
                "rps": round(rps, 2),
                "active_users": active_users,
                "avg_response_ms": round(avg_response, 2),
                "total_requests": self.stats["total_requests"],
                "recent_requests": list(recent)[-50:],
                "top_endpoints": dict(sorted(self.stats["by_endpoint"].items(), key=lambda x: x[1], reverse=True)[:10])
            }

real_traffic_monitor = RealTrafficMonitor()
