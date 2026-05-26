require('dotenv').config();
const supabase = require('../config/supabase');

const DEFAULT_SIZES = ['IT 46', 'IT 48', 'IT 50', 'IT 52'];

const CATALOG = [
  {
    slug: 'heritage-suit',
    name: 'The Heritage Modernist Suit',
    price_cents: 125000,
    description: 'Charcoal Grey tailored suit with intricate 24k gold Tibeb embroidery.',
    category: 'suits',
    collection: 'Heritage Edit',
    materials: 'Italian wool / 24k gold thread Tibeb',
    featured: true,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAOyijPm1Ox0Ibg5LKTnbHYcTNf7rGkQ-1__nNMaTBjXm-ma5FuwFXUKNZO1lmVSHLntOKd0BDTZ_YN6BjaGYbX80xhVn48cvn0f4Pk6g0zzlGmco3YMiFThSBrsWIC8A__qhLuUSsCnglPfx8DqCx6wJFpkppQzKD6zeGVjpKcOSOFNv1Fglw2S6_j4tNDbxCmnSYjDoQEgN28Xzi5G-xDQFi5vXCbP0X47mmoCabXOCBb1FmArX32-5ltn4nMV6irtVLKKME2c3Y',
  },
  {
    slug: 'negus-suit',
    name: 'Contemporary Negus Suit',
    price_cents: 145000,
    description: 'Charcoal Grey with exquisite, handcrafted hand-woven lapel Tibeb detailing.',
    category: 'suits',
    collection: 'Negus Suits',
    materials: 'Italian wool / hand-woven lapel Tibeb',
    featured: true,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAOyijPm1Ox0Ibg5LKTnbHYcTNf7rGkQ-1__nNMaTBjXm-ma5FuwFXUKNZO1lmVSHLntOKd0BDTZ_YN6BjaGYbX80xhVn48cvn0f4Pk6g0zzlGmco3YMiFThSBrsWIC8A__qhLuUSsCnglPfx8DqCx6wJFpkppQzKD6zeGVjpKcOSOFNv1Fglw2S6_j4tNDbxCmnSYjDoQEgN28Xzi5G-xDQFi5vXCbP0X47mmoCabXOCBb1FmArX32-5ltn4nMV6irtVLKKME2c3Y',
  },
  {
    slug: 'gabi-tunic',
    name: 'The Artisan Gabi Tunic',
    price_cents: 72000,
    description: 'Hand-spun organic emerald weave tunic representing traditional comfort.',
    category: 'tunics',
    collection: 'Heritage Edit',
    materials: '100% hand-woven Gabi cotton',
    featured: true,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBDEmj5AOH4ciFe4Xu8JtQR1lt3cvII18TgmGFOKYDGqbgZOHiCPr1wlPh402wtx_jS013EVN_LPGVunAJmk8lQznITelibGop1wZosXrA-NFB7jOK4joBg78-r59bAaP84ysVjDbl9LRh4B9U9RFOn6yLZ5_coMhGucWU1uQdHSa2odIblmovUsTG15_sh1zX6obFQfvDHNcxxsCZ1Do13N1Z8p1HLKpGubmZjUDSTdquhoLKNI0jnGqnPihL3uf-FHKAxPFEkmbs',
  },
  {
    slug: 'negade-blazer',
    name: 'City Negade Blazer',
    price_cents: 89000,
    description: 'Tailored blazer in linen with deep navy tones and pocket-square accents.',
    category: 'blazers',
    collection: 'City Edit',
    materials: 'Italian linen / East African accents',
    featured: true,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA7si1vTCGyOBQo5aElSk334feMezql9lBWEuIhes1GJ9IoUPhLv5oJT-0pJuKraG65EYyVPbxaRMACa9X47ie_3pjo5lTva-2GF9_985G9EkFA_rl3JDtwi0jKXkyrB2CeKFPvLUfHFplUnU6kGSpRNGBf1owB5dqbjXtwqDgYUf1Tc1W5g4k_DFT05XVC-nePDf0-LPuaMjMdWV1TzuS679PhSIVNzgpVOQpZbMesz-rAfCL1k7Zwor99xXD5zlk8Bb77ayShBMM',
  },
  {
    slug: 'axumite-belt',
    name: 'Axumite Leather Belt',
    price_cents: 34000,
    description: 'Premium handcrafted dark tan leather belt with architectural gold buckle details.',
    category: 'accessories',
    collection: 'Heritage Edit',
    materials: 'Hand-tooled leather / brass buckle',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCHtCntVzkRH3PIKKKBUUiHxLxlhZYHFAUWq3C5yaoC0oJRh8gz8sJgWw7ts69YtuZRo783GY1MzBm7wcmOr-7GH4jv76yDwTWniRBH-L6Uwur8Zwwgq0wWHYD_Kkc2HMHOqZLgQdoS_LYIf0xeJc5BAqC472rFsOxEnznRie4rwnADiuWwzW9Px94Lw0PHQtDdCDwVr6QYVuQ71gBIZVEyuin8FEi0u8J--gD3CM34jcM5L3ueCaqbTzAyhDFZZtSm37FBwCrJg3Y',
    sizes: ['85cm', '90cm', '95cm', '100cm'],
  },
  {
    slug: 'axumite-belt-light',
    name: 'Axumite Heritage Belt (Tan)',
    price_cents: 24500,
    description: 'Lighter variant rest on linen rest belt with Axum pattern buckle.',
    category: 'accessories',
    collection: 'Heritage Edit',
    materials: 'Tan leather / brass buckle',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCHtCntVzkRH3PIKKKBUUiHxLxlhZYHFAUWq3C5yaoC0oJRh8gz8sJgWw7ts69YtuZRo783GY1MzBm7wcmOr-7GH4jv76yDwTWniRBH-L6Uwur8Zwwgq0wWHYD_Kkc2HMHOqZLgQdoS_LYIf0xeJc5BAqC472rFsOxEnznRie4rwnADiuWwzW9Px94Lw0PHQtDdCDwVr6QYVuQ71gBIZVEyuin8FEi0u8J--gD3CM34jcM5L3ueCaqbTzAyhDFZZtSm37FBwCrJg3Y',
    sizes: ['85cm', '90cm', '95cm', '100cm'],
  },
  {
    slug: 'ritual-vest',
    name: 'Imperial Ritual Vest',
    price_cents: 68000,
    description: 'Wool knitted luxury vest with hand-embellished geometric stitch motifs.',
    category: 'vests',
    collection: 'Heritage Edit',
    materials: 'Merino wool / hand-stitched motifs',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD7r4L-hRe8rLWr0hLadRlJS1egeUffXFzsUHfRqgKvqhFxenHlGBGqvx4w7LasTNsF97ubmjtjKESQh0MVMf_O3rCDXeZFveYacifIy3PZpXGPqnAcfCwsL5cWJfZsJo6dzdym5MfHymDplo0zIykdPI0JGsoTyECtCyRMHFOz_eQaOnVpfLGnRoa7OJ9aPW-jG6eQ-bUjryTEwYPOVOrfH3KiD8FV3I8JqmVMZn8mRmriyOFtkE18pPCCD5IJ8ru50XMOa2ZBq38',
  },
  {
    slug: 'empire-loafers',
    name: 'Empire Loafers',
    price_cents: 38000,
    description: 'Premium black leather loafers featuring subtle gold thread lining.',
    category: 'shoes',
    collection: 'City Edit',
    materials: 'Italian calfskin / gold thread lining',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD7r4L-hRe8rLWr0hLadRlJS1egeUffXFzsUHfRqgKvqhFxenHlGBGqvx4w7LasTNsF97ubmjtjKESQh0MVMf_O3rCDXeZFveYacifIy3PZpXGPqnAcfCwsL5cWJfZsJo6dzdym5MfHymDplo0zIykdPI0JGsoTyECtCyRMHFOz_eQaOnVpfLGnRoa7OJ9aPW-jG6eQ-bUjryTEwYPOVOrfH3KiD8FV3I8JqmVMZn8mRmriyOFtkE18pPCCD5IJ8ru50XMOa2ZBq38',
    sizes: ['EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44'],
  },
  {
    slug: 'tibeb-silk-square',
    name: 'Tibeb Silk Square',
    price_cents: 8500,
    description: '100% Habesha hand-spun silk pocket square in rich gold accents.',
    category: 'accessories',
    collection: 'Heritage Edit',
    materials: '100% silk',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD7r4L-hRe8rLWr0hLadRlJS1egeUffXFzsUHfRqgKvqhFxenHlGBGqvx4w7LasTNsF97ubmjtjKESQh0MVMf_O3rCDXeZFveYacifIy3PZpXGPqnAcfCwsL5cWJfZsJo6dzdym5MfHymDplo0zIykdPI0JGsoTyECtCyRMHFOz_eQaOnVpfLGnRoa7OJ9aPW-jG6eQ-bUjryTEwYPOVOrfH3KiD8FV3I8JqmVMZn8mRmriyOFtkE18pPCCD5IJ8ru50XMOa2ZBq38',
    sizes: ['One Size'],
  },
];

async function run() {
  console.log('Seeding products...');

  for (const item of CATALOG) {
    const { image, sizes, ...productFields } = item;

    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('slug', productFields.slug)
      .maybeSingle();

    let productId;
    if (existing) {
      const { data, error } = await supabase
        .from('products')
        .update(productFields)
        .eq('id', existing.id)
        .select('id')
        .single();
      if (error) throw error;
      productId = data.id;
      await supabase.from('product_images').delete().eq('product_id', productId);
      await supabase.from('product_sizes').delete().eq('product_id', productId);
    } else {
      const { data, error } = await supabase
        .from('products')
        .insert(productFields)
        .select('id')
        .single();
      if (error) throw error;
      productId = data.id;
    }

    if (image) {
      const { error: imgErr } = await supabase
        .from('product_images')
        .insert({ product_id: productId, url: image, alt: productFields.name, sort_order: 0 });
      if (imgErr) throw imgErr;
    }

    const sizeLabels = sizes && sizes.length ? sizes : DEFAULT_SIZES;
    const sizeRows = sizeLabels.map((label) => ({
      product_id: productId,
      size_label: label,
      stock_qty: 25,
    }));
    const { error: sizeErr } = await supabase.from('product_sizes').insert(sizeRows);
    if (sizeErr) throw sizeErr;

    console.log(`  ${existing ? 'updated' : 'inserted'}: ${productFields.slug}`);
  }

  console.log('Done.');
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
