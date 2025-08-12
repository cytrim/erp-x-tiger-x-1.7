/*  2025 Tiger X Panel  Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import { Router } from 'express';
import auth from './auth.routes.js';
import customers from './customers.routes.js';
import products from './products.routes.js';
import quotes from './quotes.routes.js';
import invoices from './invoices.routes.js';
import payments from './payments.routes.js';
import me from './me.routes.js';
import dashboard from './dashboard.routes.js';
import admin from './admin.routes.js';

const r = Router();
r.use('/auth', auth);
r.use('/customers', customers);
r.use('/products', products);
r.use('/quotes', quotes);
r.use('/invoices', invoices);
r.use('/payments', payments);
r.use('/me', me);
r.use('/dashboard', dashboard);
r.use('/admin', admin);

export default r;
