"""Scrape blocked retailers with non-headless Chrome + Xvfb - domcontentloaded approach."""
import subprocess, os, time, json, sys

# Start Xvfb
xvfb = subprocess.Popen(['/opt/X11/bin/Xvfb', ':99', '-screen', '0', '1920x1080x24'],
                         stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
os.environ['DISPLAY'] = ':99'
time.sleep(1)

from rebrowser_playwright.sync_api import sync_playwright

results = {}
p = sync_playwright().start()

# 1. Stradivarius
print("Stradivarius...", file=sys.stderr)
try:
    browser = p.chromium.launch(headless=False, channel='chrome', args=['--no-sandbox'])
    ctx = browser.new_context(viewport={'width': 1440, 'height': 900}, locale='fr-FR', timezone_id='Europe/Paris')
    page = ctx.new_page()
    page.goto('https://www.stradivarius.com/fr/', timeout=30000, wait_until='domcontentloaded')
    page.wait_for_timeout(8000)
    # Scroll to trigger lazy loading
    page.evaluate("""() => window.scrollTo(0, document.body.scrollHeight)""")
    page.wait_for_timeout(3000)
    page.evaluate("""() => window.scrollTo(0, 0)""")
    page.wait_for_timeout(2000)
    hrefs = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('a[href]')).map(el => el.href);
    }""")
    results['stradivarius'] = {
        'title': page.title(),
        'final_url': page.url,
        'hrefs_count': len(hrefs),
        'product_urls': [h for h in hrefs if '/fr/' in h and '-c' in h and h.count('-c') == 1 and not any(
            nav in h for nav in ['login', 'wish', 'store', 'search'])]
        [:5]
    }
    browser.close()
except Exception as e:
    results['stradivarius'] = f'ERROR: {type(e).__name__}: {e}'

# 2. Weekday
print("Weekday...", file=sys.stderr)
try:
    browser = p.chromium.launch(headless=False, channel='chrome', args=['--no-sandbox'])
    ctx = browser.new_context(viewport={'width': 1440, 'height': 900}, locale='fr-FR', timezone_id='Europe/Paris')
    page = ctx.new_page()
    page.goto('https://www.weekday.com/fr_fr/', timeout=30000, wait_until='domcontentloaded')
    page.wait_for_timeout(8000)
    page.evaluate("""() => window.scrollTo(0, document.body.scrollHeight)""")
    page.wait_for_timeout(3000)
    hrefs = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('a[href]')).map(el => el.href);
    }""")
    results['weekday'] = {
        'title': page.title(),
        'final_url': page.url,
        'hrefs_count': len(hrefs),
        'product_urls': [h for h in hrefs if '/p/' in h or '-119' in h or '-129' in h][:5],
        'sample_all': [h for h in hrefs if 'http' in h and 'javascript' not in h][:10]
    }
    browser.close()
except Exception as e:
    results['weekday'] = f'ERROR: {type(e).__name__}: {e}'

# 3. Victoria's Secret - try product list page with grid items
print("Victoria's Secret...", file=sys.stderr)
try:
    browser = p.chromium.launch(headless=False, channel='chrome', args=['--no-sandbox'])
    ctx = browser.new_context(viewport={'width': 1440, 'height': 900}, locale='en-US')
    page = ctx.new_page()
    page.goto('https://www.victoriassecret.com/us/vs/bras/shop-all-bras', timeout=30000, wait_until='domcontentloaded')
    page.wait_for_timeout(8000)
    page.evaluate("""() => window.scrollTo(0, document.body.scrollHeight)""")
    page.wait_for_timeout(3000)
    hrefs = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('a[href]')).map(el => el.href);
    }""")
    # VS product pages have various patterns
    results['victoriassecret'] = {
        'title': page.title(),
        'final_url': page.url,
        'hrefs_count': len(hrefs),
        'product_urls': [h for h in hrefs if 'shop-all-bras/' in h or '-pid-' in h or '/product/' in h.lower() or ('/bras/' in h and h.count('/') > 5)][:5],
        'sample_product_looking': [h for h in hrefs if '/bras/' in h and 'http' in h][:10]
    }
    browser.close()
except Exception as e:
    results['victoriassecret'] = f'ERROR: {type(e).__name__}: {e}'

p.stop()
xvfb.terminate()

print(json.dumps(results, indent=2))
