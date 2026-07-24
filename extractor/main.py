from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from scraper import VideoExtractor
from cache import cache

app = FastAPI(title="Video Extractor API")
extractor = VideoExtractor()

class ExtractRequest(BaseModel):
    url: str

class ExtractResponse(BaseModel):
    video_url: str
    cached: bool
    expires_in: int

@app.post("/extract", response_model=ExtractResponse)
async def extract_video(req: ExtractRequest):
    # 1. Check cache
    cached_data = cache.get(req.url)
    if cached_data:
        import time
        expires_in = cached_data.expires_at - int(time.time())
        return ExtractResponse(
            video_url=cached_data.video_url,
            cached=True,
            expires_in=expires_in
        )
    
    # 2. Extract using Playwright
    # (Por enquanto hardcoded para DooPlay, mas pode ser expandido por domínio)
    video_url = await extractor.extract_dooplay(req.url)
    
    if not video_url:
        raise HTTPException(status_code=404, detail="Não foi possível extrair o vídeo.")
        
    # 3. Save to cache (4 hours TTL)
    cache.set(req.url, video_url, {})
    
    return ExtractResponse(
        video_url=video_url,
        cached=False,
        expires_in=14400
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
