const express = require('express');
const supabase = require('../config/supabase');
const { HttpError } = require('../middleware/error');

const router = express.Router();

// GET /api/orders/:orderNo?email=
router.get('/:orderNo', async (req, res, next) => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_no', req.params.orderNo)
      .maybeSingle();
    if (error) throw error;
    if (!order) throw new HttpError(404, 'Order not found');

    if (req.query.email && req.query.email.toLowerCase() !== order.customer_email.toLowerCase()) {
      throw new HttpError(403, 'Email does not match this order');
    }

    const { data: items, error: itemsErr } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);
    if (itemsErr) throw itemsErr;

    res.json({
      order: {
        order_no: order.order_no,
        status: order.status,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        shipping_address: order.shipping_address,
        subtotal_cents: order.subtotal_cents,
        shipping_cents: order.shipping_cents,
        total_cents: order.total_cents,
        subtotal: order.subtotal_cents / 100,
        shipping: order.shipping_cents / 100,
        total: order.total_cents / 100,
        currency: order.currency,
        created_at: order.created_at,
        paid_at: order.paid_at,
        items: items.map((i) => ({
          name: i.product_name_snapshot,
          image: i.product_image_snapshot,
          size_label: i.size_label,
          qty: i.qty,
          price_cents: i.price_cents,
          price: i.price_cents / 100,
          line_total: (i.price_cents * i.qty) / 100,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
