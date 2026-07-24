import sqlite3
import time
from typing import Optional, Dict, Any
from pydantic import BaseModel

class ExtractedVideo(BaseModel):
    original_url: str
    video_url: str
    headers: Dict[str, str] = {}
    expires_at: int

class CacheDB:
    def __init__(self, db_path="cache.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS video_cache (
                    original_url TEXT PRIMARY KEY,
                    video_url TEXT NOT NULL,
                    headers TEXT,
                    expires_at INTEGER NOT NULL
                )
            ''')
            conn.commit()
            
    def get(self, url: str) -> Optional[ExtractedVideo]:
        self._cleanup()
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT video_url, headers, expires_at FROM video_cache WHERE original_url = ?", 
                (url,)
            )
            row = cursor.fetchone()
            if row:
                import json
                headers = json.loads(row[1]) if row[1] else {}
                return ExtractedVideo(
                    original_url=url,
                    video_url=row[0],
                    headers=headers,
                    expires_at=row[2]
                )
        return None

    def set(self, url: str, video_url: str, headers: Dict[str, str], ttl_seconds: int = 14400):
        expires_at = int(time.time()) + ttl_seconds
        import json
        headers_str = json.dumps(headers)
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                INSERT OR REPLACE INTO video_cache (original_url, video_url, headers, expires_at)
                VALUES (?, ?, ?, ?)
            ''', (url, video_url, headers_str, expires_at))
            conn.commit()

    def _cleanup(self):
        current_time = int(time.time())
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM video_cache WHERE expires_at < ?", (current_time,))
            conn.commit()

cache = CacheDB()
