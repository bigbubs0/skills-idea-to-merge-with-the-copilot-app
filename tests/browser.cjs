const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');

(async () => {
  // Optional packaged Chromium for restricted CI environments; ordinary runs
  // use `npx playwright install chromium` and need no environment overrides.
  const bundled = process.env.CHROMIUM_MODULE ? (await import(process.env.CHROMIUM_MODULE)).default : null;
  const browser = await chromium.launch(bundled ? {
    executablePath: await bundled.executablePath(), args: ['--single-process', '--no-zygote', '--disable-dev-shm-usage'], headless: true
  } : {headless: true});
  try {
    const context = await browser.newContext({viewport:{width:1280,height:900},permissions:['clipboard-read','clipboard-write']});
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const base = process.env.APP_URL || 'http://127.0.0.1:4322';
    await page.goto(base);
    const add = async url => {
      await page.locator('#url').fill(url);
      await page.getByRole('button',{name:'Add bookmark',exact:true}).click();
    };
    const labels = () => page.locator('.bookmark-label').allTextContents();
    const rows = page.locator('li.bookmark');
    await page.locator('#url').waitFor();
    assert.equal(await page.locator('#list-header').isVisible(),false);
    await add('github.com/features/copilot');
    assert.deepEqual(await labels(), ['https://github.com/features/copilot :: mona-1']);
    await page.reload();
    await rows.first().waitFor();
    assert.deepEqual(await labels(), ['https://github.com/features/copilot :: mona-1']);
    await page.getByRole('button',{name:'Copy mona-1',exact:true}).click();
    assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),'mona-1');
    await add('javascript:alert(1)');
    assert.equal(await rows.count(),1);
    assert.equal(await page.locator('#url').getAttribute('aria-invalid'),'true');
    page.once('dialog',dialog=>dialog.dismiss());
    await page.getByRole('button',{name:'Clear all',exact:true}).click();
    assert.equal(await rows.count(),1);
    page.once('dialog',dialog=>dialog.accept());
    await page.getByRole('button',{name:'Clear all',exact:true}).click();
    assert.equal(await rows.count(),0);
    assert.equal(await page.evaluate(()=>localStorage.getItem('mona-bookmarks')),null);
    for (const raw of ['broken', '{}', 'null', '["legacy"]']) {
      await page.evaluate(raw=>localStorage.setItem('mona-bookmarks',raw),raw);
      await page.reload();
      await page.locator('#url').waitFor();
      assert.equal(await rows.count(),0);
      await add('example.com');
      assert.deepEqual(await labels(),['https://example.com/ :: mona-1']);
    }
    // Simulate a quota failure: reads still work, writes fail. Both new rows
    // must remain in memory across subsequent adds until the page reloads.
    await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw new DOMException('Quota exceeded','QuotaExceededError')};});
    await add('example.org/a');
    await add('example.net/b');
    assert.equal(await rows.count(),3,'A second add must retain the first unsaved bookmark');
    await page.reload();
    await rows.first().waitFor();
    assert.equal(await rows.count(),1);
    // Disabled browser storage also preserves multiple bookmarks in this tab.
    const blocked = await context.newPage();
    await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError')}}));
    await blocked.goto(base);
    for (const url of ['example.org','example.net']) {
      await blocked.locator('#url').fill(url);
      await blocked.getByRole('button',{name:'Add bookmark',exact:true}).click();
    }
    assert.equal(await blocked.locator('li.bookmark').count(),2);
    await blocked.close();
    // Capture only genuine rendered application output, after successful checks.
    await page.evaluate(()=>localStorage.removeItem('mona-bookmarks'));
    await page.reload();
    await add('https://github.com/features/copilot');
    await add('https://learn.github.com/skills');
    await page.reload();
    await rows.first().waitFor();
    assert.equal(await rows.count(),2);
    await page.evaluate(()=>document.fonts.ready);
    if (process.env.CAPTURE_PROOF === '1') {
      await fs.mkdir('submission',{recursive:true});
      await page.screenshot({path:'submission/demo-proof.png',fullPage:true});
    }
    await page.setViewportSize({width:375,height:812});
    if (await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth)) {
      console.error(await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth).map(e=>({tag:e.tagName,class:e.className,width:e.getBoundingClientRect().width,right:e.getBoundingClientRect().right}))));
    }
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true,'Mobile layout must not overflow');
    assert.deepEqual(errors,[],'No uncaught browser errors');
    console.log('Browser checks passed: add, normalize, reload, copy, invalid URLs, clear confirmation, corrupt storage, quota failures, blocked storage, mobile layout.');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
