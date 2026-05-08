import asyncio
import os
from playwright.async_api import async_playwright

async def get_timetable_screenshot(group_name: str):
    """
    tsue.edupage.org saytidan guruh jadvalini screenshot qiladi.
    """
    output_path = f"static/temp_{group_name.replace('/', '_')}.png"
    
    async with async_playwright() as p:
        # Brauzerni ishga tushirish (Railway uchun --no-sandbox kerak)
        browser = await p.chromium.launch(headless=True, args=["--no-sandbox", "--disable-setuid-sandbox"])
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()

        try:
            # Saytga kirish
            await page.goto("https://tsue.edupage.org/timetable/", wait_until="networkidle")
            
            # Cookie bannerni yopish (agar chiqsa)
            try:
                cookie_btn = page.locator("button:has-text('KELISHDIKMI')")
                if await cookie_btn.is_visible():
                    await cookie_btn.click()
            except: pass

            # 'Sinflar' (Groups) tugmasini bosish
            # Edupage'da bu tugma odatda sidebar yoki yuqorida bo'ladi
            await page.click("text=Sinflar")
            await asyncio.sleep(1) # Sidebar ochilishi uchun

            # Guruhni qidirish va bosish
            group_locator = page.locator(f"text={group_name}")
            if await group_locator.count() > 0:
                await group_locator.first.click()
                await asyncio.sleep(2) # Jadval yuklanishi uchun
                
                # Jadval gridini screenshot qilish
                # Odatda .timetable-grid yoki shunga o'xshash klassda bo'ladi
                # Biz butun sahifani yoki asosiy qismni olamiz
                await page.screenshot(path=output_path, full_page=False)
                await browser.close()
                return output_path
            else:
                await browser.close()
                return None

        except Exception as e:
            print(f"Timetable error: {e}")
            await browser.close()
            return None

if __name__ == "__main__":
    # Test uchun
    asyncio.run(get_timetable_screenshot("II-53/24"))
