"""Final extraction of product URLs with non-headless Chrome."""
import subprocess, os, time, json, sys

xvfb = subprocess.Popen(['/opt/X11/bin/Xvfb', ':99', '-screen', '0', '1920x1080x24'],
                         stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
os.environ['DISPLAY'] = ':99'
time.sleep(1)

from rebrowser_playwright.sync_api import sync_playwright

results = {}
p = sync_playwright().start()

def extract_product_urls(page, patterns):
    try:
        hrefs = page.evaluate("""() => {
            return Array.from(document.querySelectorAll('a[href]')).map(el => el.href);
        }""")
    except:
        return []
    matched = []
    for h in hrefs:
        for pat in patterns:
            if pat in h:
                matched.append(h)
                break
    return list(set(matched))

# 1. Stradivarius - navigate to category page
print("Stradivarius category...", file=sys.stderr)
try:
    browser = p.chromium.launch(headless=False, channel='chrome', args=['--no-sandbox'])
    ctx = browser.new_context(viewport={'width': 1440, 'height': 900}, locale='fr-FR', timezone_id='Europe/Paris')
    page = ctx.new_page()
    page.goto('https://www.stradivarius.com/fr/femme/vetements/robes-c1020376015.html', timeout=30000, wait_until='domcontentloaded')
    time.sleep(8)
    # Scroll to load products
    for i in range(3):
        page.evaluate("""() => window.scrollTo(0, document.body.scrollHeight * """ + str(i+1) + """/3)""")
        time.sleep(1)
    time.sleep(3)
    hrefs = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('a[href]')).map(el => el.href);
    }""")
    results['stradivarius'] = {
        'title': page.title(),
        'final_url': page.url,
        'hrefs_count': len(hrefs),
        'product_urls': [h for h in hrefs if '/fr/' in h and not any(x in h for x in ['login', 'wish', 'store', 'search', 'gift', 'vetements'])]
        [:10],
        'vetements_urls': [h for h in hrefs if 'vetements' in h and 'c1020376015' not in h][:5]
    }
    browser.close()
except Exception as e:
    results['stradivarius'] = f'ERROR: {type(e).__name__}: {e}'

# 2. Weekday - women's category
print("Weekday women...", file=sys.stderr)
try:
    browser = p.chromium.launch(headless=False, channel='chrome', args=['--no-sandbox'])
    ctx = browser.new_context(viewport={'width': 1440, 'height': 900}, locale='fr-FR', timezone_id='Europe/Paris')
    page = ctx.new_page()
    page.goto('https://www.weekday.com/fr-fr/women/view-all/', timeout=30000, wait_until='domcontentloaded')
    time.sleep(8)
    for i in range(3):
        page.evaluate("""() => window.scrollTo(0, document.body.scrollHeight * """ + str(i+1) + """/3)""")
        time.sleep(1)
    time.sleep(3)
    results['weekday'] = {
        'title': page.title(),
        'final_url': page.url,
        'product_urls': extract_product_urls(page, ['/fr-fr/p/women/', '/fr-fr/p/'])[:5]
    }
    browser.close()
except Exception as e:
    results['weekday'] = f'ERROR: {type(e).__name__}: {e}'

# 3. Victoria's Secret - try to find product detail pages
print("VS product listing...", file=sys.stderr)
try:
    browser = p.chromium.launch(headless=False, channel='chrome', args=['--no-sandbox'])
    ctx = browser.new_context(viewport={'width': 1440, 'height': 900}, locale='en-US')
    page = ctx.new_page()
    page.goto('https://www.victoriassecret.com/us/vs/bras/shop-all-bras', timeout=30000, wait_until='domcontentloaded')
    time.sleep(8)
    for i in range(3):
        page.evaluate("""() => window.scrollTo(0, document.body.scrollHeight * """ + str(i+1) + """/3)""")
        time.sleep(1)
    time.sleep(3)
    # Try many URL patterns
    hrefs = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('a[href]')).map(el => el.href);
    }""")
    results['victoriassecret'] = {
        'title': page.title(),
        'final_url': page.url,
        'hrefs_count': len(hrefs),
        # Try to find product URLs by looking for numeric IDs or specific patterns
        'with_numbers': [h for h in hrefs if any(c.isdigit() for c in h) and '/bras/' in h and 'shop-all' not in h][:5],
        'sample_all_bras': [h for h in hrefs if '/bras/' in h or '/panties/' in h or '/vs/p/' in h][:10]
    }
    browser.close()
except Exception as e:
    results['victoriassecret'] = f'ERROR: {type(e).__name__}: {e}'

p.stop()
xvfb.terminate()

print(json.dumps(results, indent=2))
