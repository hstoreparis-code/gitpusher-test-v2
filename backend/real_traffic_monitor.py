"""Real-time traffic monitoring with actual request metrics"""
from fastapi import Request
from datetime import datetime, timezone
import time
from collections import deque, defaultdict
from threading import Lock
import httpx

class RealTrafficMonitor:
    def __init__(self):
        self.requests = deque(maxlen=1000)
        self.lock = Lock()
        self.stats = {
            "total_requests": 0,
            "by_endpoint": {},
            "by_method": {},
            "by_status": {},
            "by_country": {},
            "by_hour": defaultdict(int),
            "by_page": {},
            "unique_ips": set(),
            "active_users": set()
        }
    
    async def get_country_from_ip(self, ip: str) -> str:
        """Get country from IP using ipapi.co"""
        if ip == "unknown" or ip.startswith("127.") or ip.startswith("192.168."):
            return "Local"
        try:
            async with httpx.AsyncClient(timeout=1.0) as client:
                r = await client.get(f"https://ipapi.co/{ip}/country_name/")
                if r.status_code == 200:
                    return r.text.strip()
        except:
            pass
        return "Unknown"
    
    async def log_request(self, request: Request, response_time_ms: float, status_code: int):
        with self.lock:
            client_ip = request.client.host if request.client else "unknown"
            current_hour = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:00")
            
            event = {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "method": request.method,
                "path": request.url.path,
                "status": status_code,
                "duration_ms": response_time_ms,
                "user_agent": request.headers.get("user-agent", "")[:100],
                "ip": client_ip,
                "hour": current_hour
            }
            
            self.requests.append(event)
            self.stats["total_requests"] += 1
            self.stats["by_endpoint"][event["path"]] = self.stats["by_endpoint"].get(event["path"], 0) + 1
            self.stats["by_method"][event["method"]] = self.stats["by_method"].get(event["method"], 0) + 1
            self.stats["by_status"][status_code] = self.stats["by_status"].get(status_code, 0) + 1
            self.stats["by_hour"][current_hour] += 1
            self.stats["by_page"][event["path"]] = self.stats["by_page"].get(event["path"], 0) + 1
            self.stats["unique_ips"].add(client_ip)
            self.stats["active_users"].add(client_ip)
    
    def get_realtime_stats(self):
        with self.lock:
            now = time.time()
            recent = [r for r in self.requests if (now - datetime.fromisoformat(r["timestamp"]).timestamp()) < 60]
            
            rps = len(recent) / 60 if recent else 0
            avg_response = sum(r["duration_ms"] for r in recent) / len(recent) if recent else 0
            active_users = len(self.stats["active_users"])
            
            # Get by country (from recent requests)
            by_country = {}
            for r in list(self.requests)[-100:]:
                country = r.get("country", "Unknown")
                by_country[country] = by_country.get(country, 0) + 1
            
            # Get by hour (last 24 hours)
            by_hour_list = []
            for hour, count in sorted(self.stats["by_hour"].items())[-24:]:
                by_hour_list.append({"hour": hour.split()[1], "count": count})
            
            # Get top pages
            top_pages = dict(sorted(self.stats["by_page"].items(), key=lambda x: x[1], reverse=True)[:10])
            
            return {
                "rps": round(rps, 2),
                "active_users": active_users,
                "unique_visitors": len(self.stats["unique_ips"]),
                "avg_response_ms": round(avg_response, 2),
                "total_requests": self.stats["total_requests"],
                "recent_requests": list(recent)[-50:],
                "top_endpoints": dict(sorted(self.stats["by_endpoint"].items(), key=lambda x: x[1], reverse=True)[:10]),
                "by_country": dict(sorted(by_country.items(), key=lambda x: x[1], reverse=True)[:10]),
                "by_hour": by_hour_list,
                "top_pages": top_pages
            }

real_traffic_monitor = RealTrafficMonitor()
