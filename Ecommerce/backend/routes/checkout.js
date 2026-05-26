const express = require('express');
const { z } = require('zod');
const supabase = require('../config/supabase');
const { HttpError } = require('../middleware/error');
const { validate } = require('../middleware/validate');

const router = express.Router();

const SHIPPING_FLAT_CENTS = 2500;

function generateOrderNo() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `HT-${ts}-${rand}`;
}

const checkoutSchema = z.object({
  cart_id: z.string().uuid(),
  customer: z.object({
    name: z.string().min(1).max(120),
    email: z.string().email(),
  }),
  shipping_address: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    region: z.string().optional(),
    postal_code: z.string().min(1),
    country: z.string().min(2),
  }),
});

// POST /api/checkout  -> creates a pending order from the cart
router.post('/', validate(checkoutSchema), async (req, res, next) => {
  try {
    const { cart_id, customer, shipping_address } = req.body;

    const { data: cart } = await supabase
      .from('carts')
      .select('id, status')
      .eq('id', cart_id)
      .maybeSingle();
    if (!cart) throw new HttpError(404, 'Cart not found');
    if (cart.status !== 'active') throw new HttpError(409, 'Cart is not active');

    const { data: items, error: itemsErr } = await supabase
      .from('cart_items')
      .select(`
        qty, price_cents_snapshot,
        product:products(id, name, price_cents,
          product_images(url, sort_order)),
        size:product_sizes(id, size_label, stock_qty)
      `)
      .eq('cart_id', cart_id);
    if (itemsErr) throw itemsErr;
    if (!items || items.length === 0) throw new HttpError(400, 'Cart is empty');

    let subtotal_cents = 0;
    const orderItemRows = [];
    for (const it of items) {
      if (!it.product || !it.size) throw new HttpError(409, 'Cart contains an unavailable item');
      if (it.qty > it.size.stock_qty) {
        throw new HttpError(409, `Insufficient stock for ${it.product.name} (${it.size.size_label})`);
      }
      const price = it.product.price_cents;
      subtotal_cents += price * it.qty;
      const image = (it.product.product_images || []).sort((a, b) => a.sort_order - b.sort_order)[0]?.url || null;
      orderItemRows.push({
        product_id: it.product.id,
        product_name_snapshot: it.product.name,
        product_image_snapshot: image,
        size_label: it.size.size_label,
        qty: it.qty,
        price_cents: price,
      });
    }

    const shipping_cents = SHIPPING_FLAT_CENTS;
    const total_cents = subtotal_cents + shipping_cents;
    const order_no = generateOrderNo();

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        order_no,
        cart_id,
        customer_name: customer.name,
        customer_email: customer.email,
        shipping_address,
        subtotal_cents,
        shipping_cents,
        total_cents,
        status: 'pending',
        payment_method: 'fake',
      })
      .select()
      .single();
    if (orderErr) throw orderErr;

    const { error: oiErr } = await supabase
      .from('order_items')
      .insert(orderItemRows.map((r) => ({ ...r, order_id: order.id })));
    if (oiErr) throw oiErr;

    res.status(201).json({
      order: {
        order_no: order.order_no,
        status: order.status,
        subtotal_cents,
        shipping_cents,
        total_cents,
        subtotal: subtotal_cents / 100,
        shipping: shipping_cents / 100,
        total: total_cents / 100,
        currency: order.currency,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/checkout/:orderNo/confirm-fake-payment
router.post('/:orderNo/confirm-fake-payment', async (req, res, next) => {
  try {
    const { data, error } = await supabase.rpc('confirm_fake_payment', {
      p_order_no: req.params.orderNo,
    });
    if (error) {
      if (error.code === 'P0002') throw new HttpError(404, 'Order not found');
      if (error.code === 'P0001') throw new HttpError(409, 'Insufficient stock — cannot complete payment');
      throw error;
    }
    if (!data) throw new HttpError(404, 'Order not found');
    res.json({
      order: {
        order_no: data.order_no,
        status: data.status,
        paid_at: data.paid_at,
        total_cents: data.total_cents,
        total: data.total_cents / 100,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
