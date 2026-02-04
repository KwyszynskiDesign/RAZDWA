import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        # The server is already running on 8082 from previous turn? No, I should start it.
        os.system("npm run preview > server_verify.log 2>&1 &")
        await asyncio.sleep(3)
        await page.goto("http://localhost:8082/#/")
        await asyncio.sleep(2)
        await page.screenshot(path="/home/jules/verification/home.png", full_page=True)
        # Also list categories found in the grid
        categories = await page.eval_on_selector_all(".category-name", "nodes => nodes.map(n => n.innerText)")
        print("Categories in grid:", categories)
        await browser.close()

asyncio.run(main())
