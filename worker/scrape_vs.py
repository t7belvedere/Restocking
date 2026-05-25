"""Extract VS product page URLs."""
import subprocess, os, time, json, sys

xvfb = subprocess.Popen(['/opt/X11/bin/Xvfb', ':99', '-screen', '0', '1920x1080x24'],
                         stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
os.environ['DISPLAY'] = ':99'
time.sleep(1)

from rebrowser_playwright.sync_api import sync_playwright

results = {}
p = sync_playwright().start()

# Victoria's Secret - try to find product links via structured data and data attributes
print("VS deep...", file=sys.stderr)
try:
    browser = p.chromium.launch(headless=False, channel='chrome', args=['--no-sandbox'])
    ctx = browser.new_context(viewport={'width': 1440, 'height': 900}, locale='en-US')
    page = ctx.new_page()
    page.goto('https://www.victoriassecret.com/us/vs/bras/shop-all-bras', timeout=60000, wait_until='domcontentloaded')
    time.sleep(10)
    # Scroll to load all products
    for i in range(5):
        page.evaluate("""() => window.scrollTo(0, document.body.scrollHeight * """ + str(i+1) + """/5)""")
        time.sleep(0.5)
    time.sleep(3)

    # Try to get product links from data attributes, onclick handlers, or product cards
    product_data = page.evaluate("""() => {
        // Try finding product cards/tiles
        const cards = document.querySelectorAll('[data-product-id], [data-product-url], .product-card, .product-tile, [class*="product"], [data-testid*="product"]');
        const results = [];
        cards.forEach(card => {
            const id = card.getAttribute('data-product-id') || card.getAttribute('data-id');
            const link = card.querySelector('a');
            const href = link ? link.href : (card.getAttribute('data-product-url') || '');
            if (href) results.push(href);
            if (id) results.push('id:' + id);
        });
        return results;
    }""")

    # Also try looking at JSON-LD
    jsonld = page.evaluate("""() => {
        const scripts = document.querySelectorAll('script[type="application/ld+json"]');
        return Array.from(scripts).map(s => {
            try { return JSON.parse(s.textContent); } catch(e) { return s.textContent.substring(0, 200); }
        });
    }""")

    # Get all URLs from onclick, data-href etc
    all_links = page.evaluate("""() => {
        const all = [];
        document.querySelectorAll('[onclick*="location"]').forEach(el => {
            const match = el.getAttribute('onclick').match(/['"]([^'"]+)['"]/);
            if (match) all.push(match[1]);
        });
        document.querySelectorAll('[data-href]').forEach(el => {
            all.push(el.getAttribute('data-href'));
        });
        document.querySelectorAll('[data-url]').forEach(el => {
            all.push(el.getAttribute('data-url'));
        });
        return all;
    }""")

    results['victoriassecret'] = {
        'title': page.title(),
        'product_cards': product_data[:10],
        'json_ld': jsonld[:3],
        'data_links': all_links[:10],
    }

    # Also try navigating to a specific product if we can find one
    # Look for any link with product-like pattern
    page2 = ctx.new_page()
    page2.goto('https://www.victoriassecret.com/us/vs/p/lightly-lined-demi-bra/50000523?skuId=500005238814', timeout=30000, wait_until='domcontentloaded')
    time.sleep(5)
    results['vs_test_product'] = {
        'title': page2.title(),
        'url': page2.url,
        'is_product': 'Add to Bag' in page2.content() or 'product' in page2.content().lower()
    }
    page2.close()

    browser.close()
except Exception as e:
    results['victoriassecret'] = f'ERROR: {type(e).__name__}: {e}'

p.stop()
xvfb.terminate()

print(json.dumps(results, indent=2))
