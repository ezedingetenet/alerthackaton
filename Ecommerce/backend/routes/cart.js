const express = require('express');
const { z } = require('zod');
const supabase = require('../config/supabase');
const { HttpError } = require('../middleware/error');
const { validate } = require('../middleware/validate');

const router = express.Router();

async function loadCart(cartId) {
  const { data: cart, error } = await supabase
    .from('carts')
    .select('*')
    .eq('id', cartId)
    .maybeSingle();
  if (error) throw error;
  if (!cart) throw new HttpError(404, 'Cart not found');

  const { data: items, error: itemsErr } = await supabase
    .from('cart_items')
    .select(`
      id, qty, price_cents_snapshot,
      product:products(id, slug, name, price_cents,
        product_images(url, sort_order)),
      size:product_sizes(id, size_label, stock_qty)
    `)
    .eq('cart_id', cartId);
  if (itemsErr) throw itemsErr;

  const hydrated = (items || []).map((it) => {
    const images = (it.product?.product_images || []).sort((a, b) => a.sort_order - b.sort_order);
    return {
      id: it.id,
      product_id: it.product?.id,
      slug: it.product?.slug,
      name: it.product?.name,
      image: images[0]?.url || null,
      size_id: it.size?.id,
      size_label: it.size?.size_label,
      qty: it.qty,
      price_cents: it.price_cents_snapshot,
      price: it.price_cents_snapshot / 100,
      line_total_cents: it.price_cents_snapshot * it.qty,
      stock: it.size?.stock_qty ?? 0,
    };
  });

  const subtotal_cents = hydrated.reduce((s, i) => s + i.line_total_cents, 0);
  const total_qty = hydrated.reduce((s, i) => s + i.qty, 0);

  return {
    id: cart.id,
    status: cart.status,
    items: hydrated,
    subtotal_cents,
    subtotal: subtotal_cents / 100,
    total_qty,
    currency: 'USD',
  };
}

// POST /api/cart  -> create new empty cart
router.post('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('carts')
      .insert({})
      .select('id')
      .single();
    if (error) throw error;
    res.status(201).json({ cart_id: data.id });
  } catch (err) {
    next(err);
  }
});

// GET /api/cart/:id
router.get('/:id', async (req, res, next) => {
  try {
    const cart = await loadCart(req.params.id);
    res.json({ cart });
  } catch (err) {
    next(err);
  }
});

// POST /api/cart/:id/items  { product_id OR product_slug, size_id OR size_label, qty }
const addItemSchema = z
  .object({
    product_id: z.string().uuid().optional(),
    product_slug: z.string().optional(),
    size_id: z.string().uuid().optional(),
    size_label: z.string().optional(),
    qty: z.number().int().positive().max(20).default(1),
  })
  .refine((d) => d.product_id || d.product_slug, { message: 'product_id or product_slug required' })
  .refine((d) => d.size_id || d.size_label, { message: 'size_id or size_label required' });

router.post('/:id/items', validate(addItemSchema), async (req, res, next) => {
  try {
    const cartId = req.params.id;

    const { data: cart } = await supabase.from('carts').select('id, status').eq('id', cartId).maybeSingle();
    if (!cart) throw new HttpError(404, 'Cart not found');
    if (cart.status !== 'active') throw new HttpError(409, 'Cart is not active');

    let product;
    if (req.body.product_id) {
      const { data } = await supabase
        .from('products')
        .select('id, price_cents')
        .eq('id', req.body.product_id)
        .maybeSingle();
      product = data;
    } else {
      const { data } = await supabase
        .from('products')
        .select('id, price_cents')
        .eq('slug', req.body.product_slug)
        .maybeSingle();
      product = data;
    }
    if (!product) throw new HttpError(404, 'Product not found');

    let sizeRow;
    if (req.body.size_id) {
      const { data } = await supabase
        .from('product_sizes')
        .select('id, stock_qty, product_id')
        .eq('id', req.body.size_id)
        .maybeSingle();
      sizeRow = data;
    } else {
      const { data } = await supabase
        .from('product_sizes')
        .select('id, stock_qty, product_id')
        .eq('product_id', product.id)
        .eq('size_label', req.body.size_label)
        .maybeSingle();
      sizeRow = data;
    }
    if (!sizeRow || sizeRow.product_id !== product.id) {
      throw new HttpError(404, 'Size not found for this product');
    }

    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, qty')
      .eq('cart_id', cartId)
      .eq('product_id', product.id)
      .eq('size_id', sizeRow.id)
      .maybeSingle();

    const newQty = (existing?.qty || 0) + req.body.qty;
    if (newQty > sizeRow.stock_qty) {
      throw new HttpError(409, `Only ${sizeRow.stock_qty} in stock`);
    }

    if (existing) {
      const { error } = await supabase.from('cart_items').update({ qty: newQty }).eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('cart_items').insert({
        cart_id: cartId,
        product_id: product.id,
        size_id: sizeRow.id,
        qty: req.body.qty,
        price_cents_snapshot: product.price_cents,
      });
      if (error) throw error;
    }

    await supabase.from('carts').update({ updated_at: new Date().toISOString() }).eq('id', cartId);

    const cartData = await loadCart(cartId);
    res.status(201).json({ cart: cartData });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/cart/:id/items/:itemId  { qty }
const patchSchema = z.object({ qty: z.number().int().min(0).max(20) });
router.patch('/:id/items/:itemId', validate(patchSchema), async (req, res, next) => {
  try {
    const { id: cartId, itemId } = req.params;
    if (req.body.qty === 0) {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)
        .eq('cart_id', cartId);
      if (error) throw error;
    } else {
      const { data: item } = await supabase
        .from('cart_items')
        .select('id, size_id')
        .eq('id', itemId)
        .eq('cart_id', cartId)
        .maybeSingle();
      if (!item) throw new HttpError(404, 'Cart item not found');

      const { data: size } = await supabase
        .from('product_sizes')
        .select('stock_qty')
        .eq('id', item.size_id)
        .single();
      if (req.body.qty > size.stock_qty) {
        throw new HttpError(409, `Only ${size.stock_qty} in stock`);
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ qty: req.body.qty })
        .eq('id', itemId);
      if (error) throw error;
    }
    res.json({ cart: await loadCart(cartId) });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cart/:id/items/:itemId
router.delete('/:id/items/:itemId', async (req, res, next) => {
  try {
    const { id: cartId, itemId } = req.params;
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId)
      .eq('cart_id', cartId);
    if (error) throw error;
    res.json({ cart: await loadCart(cartId) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
