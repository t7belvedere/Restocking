"""Scrape product page URLs from multiple retailers using rebrowser_playwright."""
import json, sys, os
from rebrowser_playwright.sync_api import sync_playwright

results = {}

p = sync_playwright().start()

# Helper: dump all unique hrefs from a page
def dump_hrefs(page, timeout=3000):
    page.wait_for_timeout(timeout)
    try:
        return page.evaluate("""() => {
            return Array.from(document.querySelectorAll('a[href]')).map(el => el.href);
        }""")
    except Exception as e:
        print(f"  evaluate error: {e}", file=sys.stderr)
        return []

# 1. Stradivarius - use Chrome channel
print("Stradivarius with Chrome channel...", file=sys.stderr)
try:
    browser = p.chromium.launch(headless=True, channel='chrome', args=['--no-sandbox', '--disable-gpu'])
    ctx = browser.new_context(
        viewport={'width': 1440, 'height': 900},
        locale='fr-FR',
        timezone_id='Europe/Paris',
    )
    page = ctx.new_page()
    page.goto('https://www.stradivarius.com/fr/femme/vetements/robes-c1020376015.html', timeout=60000, wait_until='domcontentloaded')
    page.wait_for_timeout(10000)
    hrefs = dump_hrefs(page)
    product_urls = [h for h in hrefs if '/fr/' in h and not h.endswith('.css') and not h.endswith('.js') and 'vetements' not in h]
    results['stradivarius'] = {
        'title': page.title(),
        'total_hrefs': len(hrefs),
        'urls': [u for u in product_urls if any(c.isdigit() for c in u)][:3]
    }
    browser.close()
except Exception as e:
    results['stradivarius'] = f'ERROR: {type(e).__name__}: {e}'

# 2. Weekday - use Chrome channel
print("Weekday with Chrome channel...", file=sys.stderr)
try:
    browser = p.chromium.launch(headless=True, channel='chrome', args=['--no-sandbox', '--disable-gpu'])
    ctx = browser.new_context(
        viewport={'width': 1440, 'height': 900},
        locale='fr-FR',
        timezone_id='Europe/Paris',
    )
    page = ctx.new_page()
    page.goto('https://www.weekday.com/en-gb/women/jeans/', timeout=60000, wait_until='domcontentloaded')
    page.wait_for_timeout(10000)
    hrefs = dump_hrefs(page)
    results['weekday'] = {
        'title': page.title(),
        'final_url': page.url,
        'total_hrefs': len(hrefs),
        'sample_urls': [h for h in hrefs if '/p/' in h or 'product' in h.lower()][:5]
    }
    browser.close()
except Exception as e:
    results['weekday'] = f'ERROR: {type(e).__name__}: {e}'

# 3. Victoria's Secret - use Chrome channel, find actual product pages
print("Victoria's Secret...", file=sys.stderr)
try:
    browser = p.chromium.launch(headless=True, channel='chrome', args=['--no-sandbox', '--disable-gpu'])
    ctx = browser.new_context(
        viewport={'width': 1440, 'height': 900},
        locale='en-US',
    )
    page = ctx.new_page()
    page.goto('https://www.victoriassecret.com/us/vs/bras', timeout=60000, wait_until='domcontentloaded')
    page.wait_for_timeout(10000)
    hrefs = dump_hrefs(page)
    # Try various patterns for VS product pages
    product_urls = []
    for h in hrefs:
        if any(pat in h for pat in ['/vs/p/', 'catalog.product', '/panties/', '/bras/', '/sleepwear/']):
            product_urls.append(h)
    results['victoriassecret'] = {
        'title': page.title(),
        'final_url': page.url,
        'total_hrefs': len(hrefs),
        'urls': list(set(product_urls))[:5]
    }
    browser.close()
except Exception as e:
    results['victoriassecret'] = f'ERROR: {type(e).__name__}: {e}'

# 4. Brandy Melville EU
print("Brandy Melville EU...", file=sys.stderr)
try:
    browser = p.chromium.launch(headless=True, channel='chrome', args=['--no-sandbox', '--disable-gpu'])
    ctx = browser.new_context(viewport={'width': 1440, 'height': 900})
    page = ctx.new_page()
    page.goto('https://eu.brandymelville.com/', timeout=60000, wait_until='domcontentloaded')
    page.wait_for_timeout(10000)
    hrefs = dump_hrefs(page)
    product_urls = [h for h in hrefs if '/products/' in h and '/collections/' not in h]
    results['brandymelville_eu'] = {
        'title': page.title(),
        'urls': list(set(product_urls))[:3]
    }
    browser.close()
except Exception as e:
    results['brandymelville_eu'] = f'ERROR: {type(e).__name__}: {e}'

# 5. Gina Tricot FR
print("Gina Tricot FR...", file=sys.stderr)
try:
    browser = p.chromium.launch(headless=True, channel='chrome', args=['--no-sandbox', '--disable-gpu'])
    ctx = browser.new_context(
        viewport={'width': 1440, 'height': 900},
        locale='fr-FR',
    )
    page = ctx.new_page()
    page.goto('https://www.ginatricot.com/fr/vetements', timeout=60000, wait_until='domcontentloaded')
    page.wait_for_timeout(10000)
    hrefs = dump_hrefs(page)
    product_urls = [h for h in hrefs if '/fr/vetements/' in h and h.count('-') > 2 and any(c.isdigit() for c in h)]
    results['ginatricot'] = {
        'title': page.title(),
        'urls': list(set(product_urls))[:3]
    }
    browser.close()
except Exception as e:
    results['ginatricot'] = f'ERROR: {type(e).__name__}: {e}'

p.stop()

print(json.dumps(results, indent=2))
