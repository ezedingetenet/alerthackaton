const express = require('express');
const supabase = require('../config/supabase');
const { HttpError } = require('../middleware/error');

const router = express.Router();

function hydrate(row) {
  if (!row) return null;
  const images = (row.product_images || []).sort((a, b) => a.sort_order - b.sort_order);
  const sizes = (row.product_sizes || []).map((s) => ({
    id: s.id,
    label: s.size_label,
    stock: s.stock_qty,
    in_stock: s.stock_qty > 0,
  }));
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    price_cents: row.price_cents,
    price: row.price_cents / 100,
    currency: row.currency,
    category: row.category,
    collection: row.collection,
    materials: row.materials,
    featured: row.featured,
    images,
    image: images[0]?.url || null,
    sizes,
  };
}

// GET /api/products?collection=&category=&featured=&search=&limit=&offset=
router.get('/', async (req, res, next) => {
  try {
    const { collection, category, featured, search } = req.query;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const offset = parseInt(req.query.offset, 10) || 0;

    let q = supabase
      .from('products')
      .select('*, product_images(*), product_sizes(*)')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (collection) q = q.eq('collection', collection);
    if (category) q = q.eq('category', category);
    if (featured === 'true') q = q.eq('featured', true);
    if (search) q = q.or(`name.ilike.%${search}%,description.ilike.%${search}%`);

    const { data, error } = await q;
    if (error) throw error;
    res.json({ products: data.map(hydrate), limit, offset });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/search?q=
router.get('/search', async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ products: [] });
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*), product_sizes(*)')
      .or(`name.ilike.%${q}%,description.ilike.%${q}%,materials.ilike.%${q}%`)
      .limit(20);
    if (error) throw error;
    res.json({ products: data.map(hydrate) });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:slug
router.get('/:slug', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*), product_sizes(*)')
      .eq('slug', req.params.slug)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new HttpError(404, 'Product not found');
    res.json({ product: hydrate(data) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
