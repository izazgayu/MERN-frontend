import Invoice from '../models/Invoice.js';
import Owner from '../models/Owner.js';

function today() {
  return new Date().toISOString().slice(0, 10);
}

export async function getInvoices(req, res) {
  try {
    const invoices = await Invoice.find()
      .populate('ownerId', 'name phone')
      .populate('appointmentId', 'date time reason')
      .sort({ createdAt: -1 });
    return res.json(invoices);
  } catch (error) {
    return res.status(500).json({ message: 'Could not fetch invoices.' });
  }
}

export async function createInvoice(req, res) {
  try {
    const { ownerId, appointmentId, amount, method, status } = req.body;
    if (!ownerId || amount == null) return res.status(400).json({ message: 'ownerId and amount are required.' });
    const invoice = await Invoice.create({
      ownerId,
      appointmentId: appointmentId || null,
      amount: Number(amount),
      method: method || 'Cash',
      status: status || 'Pending',
      date: today(),
    });
    return res.status(201).json(invoice);
  } catch (error) {
    return res.status(500).json({ message: 'Could not create invoice.' });
  }
}

export async function updateInvoice(req, res) {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found.' });
    return res.json(invoice);
  } catch (error) {
    return res.status(500).json({ message: 'Could not update invoice.' });
  }
}
