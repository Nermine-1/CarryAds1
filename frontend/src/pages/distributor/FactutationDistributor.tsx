import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDownload, FaRegFilePdf } from 'react-icons/fa';
import '../../styles/pages/Facturation.css';

// Define types for a payment
interface Payment {
  id: string;
  invoiceNumber: string;
  campaignName: string;
  issueDate: string;
  amountReceived: number;
}

const FacturationDistributeur = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch payments from backend
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:4242/api/distributeur/paiements', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch payments');
        const paymentsData = await response.json();
        setPayments(paymentsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

 const handleViewPayment = async (payment: Payment) => {
  try {
    const response = await fetch(`http://localhost:4242/api/distributeur/paiements/${payment.id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payment details');
    }

    const paymentData = await response.json();

    // Open a new window with payment details
    const paymentWindow = window.open('', '_blank');
    if (paymentWindow) {
      paymentWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment ${payment.invoiceNumber}</title>
          <style>
            body {
              font-family: 'Inter', sans-serif;
              color: #1f2937;
              padding: 2rem;
              max-width: 800px;
              margin: 0 auto;
              background-color: #f9fafb;
            }
            .payment-container {
              background-color: #fff;
              border-radius: 1rem;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
              padding: 2rem;
            }
            h1 {
              font-size: 2.5rem;
              font-weight: 800;
              text-align: center;
              margin-bottom: 1rem;
            }
            .section-title {
              font-size: 1.5rem;
              font-weight: 700;
              margin-bottom: 1rem;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 1.5rem;
            }
            th, td {
              padding: 0.75rem;
              border-bottom: 1px solid #e5e7eb;
              text-align: left;
            }
            th {
              background-color: #f3f4f6;
              font-weight: 600;
              color: #6b7280;
              text-transform: uppercase;
              font-size: 0.875rem;
            }
            .footer {
              margin-top: 2rem;
              font-size: 0.875rem;
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <div class="payment-container">
            <h1>Payment Invoice</h1>
            <div class="info-section">
              <p><strong>Invoice Number:</strong> ${payment.invoiceNumber}</p>
              <p><strong>Issue Date:</strong> ${paymentData.issueDate}</p>
            </div>
            <div class="section-title">Payment Details</div>
            <table>
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Campaign</td>
                  <td>${paymentData.campaignName}</td>
                </tr>
                <tr>
                  <td>Issue Date</td>
                  <td>${paymentData.issueDate}</td>
                </tr>
                <tr>
                  <td>Amount Received</td>
                  <td>${paymentData.amountReceived} DT</td>
                </tr>
              </tbody>
            </table>
            <div class="footer">
              <p><strong>Note:</strong> This invoice is generated automatically. For any questions, contact us at contact@carryads.com.</p>
            </div>
          </div>
        </body>
        </html>
      `);
      paymentWindow.document.close();
    } else {
      alert('Failed to open window. Check your pop-up blocker settings.');
    }
  } catch (error) {
    console.error('Error displaying payment details:', error);
    alert('An error occurred while displaying payment details.');
  }
};


  const hasPayments = payments.length > 0;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <motion.div
      className="billing-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="page-header">
        <div className="header-info">
          <h1 className="page-title">Received Payments</h1>
          <p className="page-subtitle">View the history of payments received for your distributions.</p>
        </div>
      </div>

      <div className="table-section">
        <h2 className="section-title">Payment History</h2>
        <AnimatePresence mode="wait">
          {hasPayments ? (
            <motion.div
              key="table-payments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="invoices-table-container"
            >
              <table className="invoices-table">
                <thead>
                  <tr>
                    <th>Invoice Number</th>
                    <th>Campaign</th>
                    <th>Issue Date</th>
                    <th>Amount Received</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <motion.tr
                      key={payment.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td>{payment.invoiceNumber}</td>
                      <td>{payment.campaignName}</td>
                      <td>{payment.issueDate}</td>
                      <td>{payment.amountReceived} DT</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-btn download-btn"
                            onClick={() => handleViewPayment(payment)}
                            title="View payment details"
                          >
                            <FaDownload />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          ) : (
            <motion.div
              key="no-payments"
              className="no-invoices-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <FaRegFilePdf className="no-invoices-icon" />
              <h2 className="no-invoices-title">No payments received.</h2>
              <p className="no-invoices-text">Your payments will appear here once your distributions are validated.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default FacturationDistributeur;
