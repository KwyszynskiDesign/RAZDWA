import asyncio
from playwright.async_api import async_playwright
import os

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Start server
        import subprocess
        process = subprocess.Popen(['npx', 'http-server', '-p', '8083', 'docs'])
        await asyncio.sleep(2)

        try:
            print("Checking CAD logic...")
            await page.goto("http://localhost:8083/#/druk-cad")
            await page.wait_for_selector("select#format")

            # Select A1
            await page.select_option("select#format", "A1")
            # Should show base length 841
            await page.wait_for_selector("text=Wymiar bazowy: 841 mm")

            # Set length to 841
            await page.fill("#length_mm", "841")
            await page.select_option("#mode", "kolor")

            # Price for A1 color should be 20.00 (from categories.json)
            await page.wait_for_selector("text=20,00 zł")
            print("CAD A1 Color Format price OK: 20,00 zł")

            # Set length to 1000 (meter price)
            await page.fill("#length_mm", "1000")
            # Meter price for Color is 25.00/mb
            # 1000mm = 1mb -> 25.00 zł
            await page.wait_for_selector("text=25,00 zł")
            print("CAD Color Meter price OK: 25,00 zł")

            print("Checking A4/A3 logic...")
            await page.goto("http://localhost:8083/#/druk-a4-a3")
            await page.wait_for_selector("#print_pages")

            await page.fill("#print_pages", "10")
            await page.select_option("#format", "A4")
            await page.select_option("#mode", "bw")

            # 10 pages A4 BW: 1-10 tier is 1.00 each -> 10.00 zł
            await page.wait_for_selector("text=10,00 zł")
            print("A4 BW 10 pages OK: 10,00 zł")

            # Add Email surcharge
            await page.check("#email_surcharge")
            # Total should still be 10.00 for the main item, but the "Add to cart" will add two items.
            # Wait, the preview usually shows the price of the main calculation.

            # Test 100 pages A4 BW -> tier 51-100 is 0.40
            await page.fill("#print_pages", "100")
            await page.wait_for_selector("text=40,00 zł")
            print("A4 BW 100 pages OK: 40,00 zł")

            await page.screenshot(path="verification/verify_final_logic.png")

        finally:
            process.terminate()
            await browser.close()

asyncio.run(run())
