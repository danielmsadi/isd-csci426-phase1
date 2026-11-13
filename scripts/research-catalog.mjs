// Read-only research helper. Emits public factual table rows; never writes files.
const pages = [
  ['engineering', 'https://liu.edu.lb/cms26/public/page.php?slug=school-of-engineering'],
  ['business', 'https://liu.edu.lb/cms26/public/page.php?slug=school-of-business'],
  ['pharmacy', 'https://liu.edu.lb/cms26/public/page.php?slug=school-of-pharmacy'],
  ['education', 'https://liu.edu.lb/cms26/public/page.php?slug=school-of-education'],
  ['arts-sciences', 'https://liu.edu.lb/cms26/public/page.php?slug=undergraduate'],
  ['arts-sciences', 'https://liu.edu.lb/NewLIU2022/SAS/graduate.php'],
];
const clean = html => html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;|&#160;/g, ' ').replace(/&#39;|&rsquo;/g, "'").replace(/\s+/g, ' ').trim();
const results = await Promise.all(pages.map(async ([school, source]) => {
  const response = await fetch(source); if (!response.ok) throw new Error(`${source}: ${response.status}`);
  const html = await response.text(); const records = [];
  for (const row of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(m => m[1]);
    if (cells.length < 4 || !/^\d+$/.test(clean(cells[1]))) continue;
    const name = clean(cells[0]).replace(/Eduction/g, 'Education');
    const level = /Teaching Diploma/i.test(name) ? 'Diploma' : /Master|Doctor/i.test(name) ? 'Graduate' : 'Undergraduate';
    const links = cells.slice(2, 5).map(c => c.match(/href=["']([^"']+)["']/i)?.[1]).map(link => link ? new URL(link.replace(/&amp;/g, '&'), source).href : null);
    records.push({ id: `${school}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '')}`, name, school, level, credits: Number(clean(cells[1])), source, verifiedOn: '2026-11-11', contract: links[0] || null, plan: links[1] || null, courses: links[2] || null, legacy: source.includes('NewLIU2022') });
  }
  return records;
}));
console.log(JSON.stringify(results.flat()));
