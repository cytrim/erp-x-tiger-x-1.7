import Customer from '../models/Customer.js';
import Product from '../models/Product.js';
import Invoice from '../models/Invoice.js';
import Quote from '../models/Quote.js';
import Payment from '../models/Payment.js';

export async function getStats(req, res, next) {
  try {
    const [customerCount, productCount, invoiceCount, quoteCount] = await Promise.all([
      Customer.countDocuments(),
      Product.countDocuments(),
      Invoice.countDocuments(),
      Quote.countDocuments()
    ]);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const [monthlyRevenue, yearlyRevenue, openInvoices, overdueInvoices] = await Promise.all([
      Invoice.aggregate([
        { $match: { date: { $gte: startOfMonth }, status: { $in: ['paid', 'partial'] }}},
        { $group: { _id: null, total: { $sum: '$totals.gross' }}}
      ]),
      Invoice.aggregate([
        { $match: { date: { $gte: startOfYear }, status: { $in: ['paid', 'partial'] }}},
        { $group: { _id: null, total: { $sum: '$totals.gross' }}}
      ]),
      Invoice.aggregate([
        { $match: { status: { $in: ['sent', 'partial'] }}},
        { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$totals.gross' }}}
      ]),
      Invoice.aggregate([
        { $match: { status: { $in: ['sent', 'overdue'] }, dueDate: { $lt: now }}},
        { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$totals.gross' }}}
      ])
    ]);
    const openQuotes = await Quote.countDocuments({ status: 'sent' });
    res.json({
      customers: customerCount,
      products: productCount,
      invoices: invoiceCount,
      quotes: quoteCount,
      revenue: { month: monthlyRevenue[0]?.total || 0, year: yearlyRevenue[0]?.total || 0 },
      openInvoices: { count: openInvoices[0]?.count || 0, total: openInvoices[0]?.total || 0 },
      overdueInvoices: { count: overdueInvoices[0]?.count || 0, total: overdueInvoices[0]?.total || 0 },
      openQuotes
    });
  } catch (e) { next(e); }
}

export async function getRecentActivity(req, res, next) {
  try {
    const limit = 10;
    const recentInvoices = await Invoice.find().populate('customerId', 'name').sort('-createdAt').limit(limit).lean();
    const recentPayments = await Payment.find().populate('customerId', 'name').populate('invoiceId', 'number').sort('-createdAt').limit(limit).lean();
    const recentCustomers = await Customer.find().sort('-createdAt').limit(5).lean();
    const activities = [];
    recentInvoices.forEach(inv => {
      activities.push({
        type: 'invoice',
        date: inv.createdAt,
        title: `Rechnung ${inv.number}`,
        description: `${inv.customerId?.name || 'Unbekannt'} - ${inv.totals?.gross || 0}€`,
        status: inv.status
      });
    });
    recentPayments.forEach(pay => {
      activities.push({
        type: 'payment',
        date: pay.createdAt,
        title: 'Zahlung erhalten',
        description: `${pay.customerId?.name || 'Unbekannt'} - ${pay.amount}€`,
        status: 'received'
      });
    });
    recentCustomers.forEach(cust => {
      activities.push({
        type: 'customer',
        date: cust.createdAt,
        title: 'Neuer Kunde',
        description: cust.name,
        status: 'new'
      });
    });
    activities.sort((a, b) => b.date - a.date);
    res.json({ activities: activities.slice(0, 15) });
  } catch (e) { next(e); }
}

export async function getChartData(req, res, next) {
  try {
    const { period = 'month' } = req.query;
    const now = new Date();
    let startDate;
    let groupBy;
    if (period === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      groupBy = { $dayOfMonth: '$date' };
    } else if (period === 'month') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      groupBy = { $dayOfMonth: '$date' };
    } else if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
      groupBy = { $month: '$date' };
    } else {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      groupBy = { $dayOfMonth: '$date' };
    }
    const revenueData = await Invoice.aggregate([
      { $match: { date: { $gte: startDate }, status: { $in: ['paid', 'partial'] }}},
      { $group: { _id: groupBy, revenue: { $sum: '$totals.gross' }, count: { $sum: 1 }}},
      { $sort: { _id: 1 }}
    ]);
    const topCustomers = await Invoice.aggregate([
      { $match: { date: { $gte: startDate }}},
      { $group: { _id: '$customerId', total: { $sum: '$totals.gross' }, count: { $sum: 1 }}},
      { $sort: { total: -1 }},
      { $limit: 5 },
      { $lookup: { from: 'customers', localField: '_id', foreignField: '_id', as: 'customer' }},
      { $unwind: '$customer' },
      { $project: { name: '$customer.name', total: 1, count: 1 }}
    ]);
    const statusDistribution = await Invoice.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$totals.gross' }}}
    ]);
    res.json({ revenue: revenueData, topCustomers, statusDistribution, period });
  } catch (e) { next(e); }
}
