import asyncio
from playwright.async_api import async_playwright
import os

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Start server
        import subprocess
        process = subprocess.Popen(['npx', 'http-server', '-p', '8084', 'docs'])
        await asyncio.sleep(2)

        try:
            # 1. Desktop view
            await page.set_viewport_size({"width": 1280, "height": 800})
            await page.goto("http://localhost:8084/")
            await asyncio.sleep(1)
            await page.screenshot(path="verification/desktop_tiles.png")
            print("Desktop screenshot saved.")

            # Count tiles
            tiles = await page.query_selector_all(".tile")
            print(f"Number of tiles found: {len(tiles)}")

            # 2. Mobile view
            await page.set_viewport_size({"width": 375, "height": 812})
            await page.goto("http://localhost:8084/")
            await asyncio.sleep(1)
            await page.screenshot(path="verification/mobile_tiles.png")
            print("Mobile screenshot saved.")

            # 3. Select a category (e.g., A4/A3)
            await page.click("text=Druk A4/A3 + skan")
            await asyncio.sleep(1)
            await page.screenshot(path="verification/category_selected.png")
            print("Category selected screenshot saved.")

            # Check if calculator loaded
            calc_visible = await page.is_visible("#viewContainer h2") # Original home message
            if not calc_visible:
                 print("Calculator area content changed (likely loaded view).")

        finally:
            process.terminate()
            await browser.close()

asyncio.run(run())
