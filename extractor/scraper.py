import asyncio
from typing import Optional
from playwright.async_api import async_playwright, Page, Request
import json

class VideoExtractor:
    def __init__(self):
        # Domínios conhecidos de anúncios para abortar (acelera o scrape e evita popups)
        self.blocked_domains = [
            "google-analytics.com", "googletagmanager.com", "doubleclick.net", 
            "popads.net", "propellerads.com", "exoclick.com", "onclickads.net",
            "histats.com", "s10.histats.com", "sstatic1.histats.com",
            "pagead2.googlesyndication.com"
        ]
        
    async def extract_dooplay(self, url: str) -> Optional[str]:
        """Extrai o link do iframe final resolvido pelo DooPlay."""
        
        # Inicia o playwright
        async with async_playwright() as p:
            # Lança chromium com argumentos anti-bot e anti-popup
            browser = await p.chromium.launch(
                headless=True,
                args=[
                    "--disable-blink-features=AutomationControlled",
                    "--disable-popup-blocking",
                    "--no-sandbox",
                    "--disable-dev-shm-usage"
                ]
            )
            
            # Usando stealth para bypass Cloudflare
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                viewport={"width": 1920, "height": 1080},
                java_script_enabled=True,
                bypass_csp=True
            )
            
            page = await context.new_page()
            
            # Configura stealth
            from playwright_stealth import Stealth
            await Stealth().apply_stealth_async(page)
            
            # Handler para bloquear ads e midia desnecessaria para acelerar
            async def intercept_route(route):
                request = route.request
                
                # Bloquear domínios de ads
                for domain in self.blocked_domains:
                    if domain in request.url:
                        await route.abort()
                        return
                        
                # Bloquear recursos pesados inúteis para o scraper
                if request.resource_type in ["image", "font", "media"]:
                    await route.abort()
                    return
                    
                await route.continue_()
            
            await page.route("**/*", intercept_route)
            
            # Fechar qualquer popup novo automaticamente
            context.on("page", lambda p: p.close())
            
            extracted_url = None
            
            # Handler para ouvir a resposta do AJAX
            async def on_response(response):
                nonlocal extracted_url
                if "admin-ajax.php" in response.url and response.request.method == "POST":
                    try:
                        post_data = response.request.post_data
                        if post_data and "action=doo_player_ajax" in post_data:
                            text = await response.text()
                            # A resposta geralmente é um iframe ou url
                            if "iframe" in text:
                                from bs4 import BeautifulSoup
                                soup = BeautifulSoup(text, "html.parser")
                                iframe = soup.find("iframe")
                                if iframe and iframe.get("src"):
                                    extracted_url = iframe.get("src")
                            elif text.startswith("http"):
                                extracted_url = text
                    except Exception as e:
                        print(f"Erro ao ler resposta AJAX: {e}")
            
            page.on("response", on_response)
            
            try:
                # 1. Abre a pagina
                print(f"Abrindo URL: {url}")
                await page.goto(url, wait_until="domcontentloaded", timeout=30000)
                
                # Aguarda Cloudflare se houver
                if "Just a moment..." in await page.title():
                    print("Aguardando desafio Cloudflare...")
                    await page.wait_for_selector(".live-search", timeout=15000) # Selector do site real
                
                # 2. Primeira tentativa: O iframe já está na página? (Ocorre no meusanimes.blog)
                print("Verificando se o player já está na página (.play-box-iframe)...")
                try:
                    iframe = await page.wait_for_selector(".play-box-iframe iframe", timeout=5000)
                    if iframe:
                        src = await iframe.get_attribute("src")
                        if src:
                            print(f"Player encontrado diretamente no HTML: {src}")
                            extracted_url = src
                except Exception:
                    print("Iframe direto não encontrado. Tentando botões AJAX DooPlay...")
                
                # 3. Segunda tentativa: Localiza as opções de player (DooPlay usa #playeroptionsul)
                if not extracted_url:
                    options_list = await page.query_selector("#playeroptionsul")
                    if options_list:
                        options = await options_list.query_selector_all("li")
                        for opt in options:
                            if extracted_url: 
                                break
                            opt_name = await opt.inner_text()
                            print(f"Clicando na opcao: {opt_name.strip()}")
                            await opt.click()
                            for _ in range(30):
                                if extracted_url:
                                    break
                                await asyncio.sleep(0.1)
                    else:
                        print("Lista de players AJAX nao encontrada.")
            except Exception as e:
                print(f"Erro no scraper: {e}")
            finally:
                await browser.close()
                
            return extracted_url

if __name__ == "__main__":
    # Teste rápido
    async def test():
        extractor = VideoExtractor()
        url = await extractor.extract_dooplay("https://meusanimes.blog/e/lazarus-dublado-1-episodio-11/")
        print("URL Extraída:", url)
        
    asyncio.run(test())
