import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCreditCard, FaRegCreditCard, FaDownload, FaExchangeAlt, FaRegFilePdf, FaFileSignature, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { loadStripe } from '@stripe/stripe-js';
import '../../styles/pages/Facturation.css';
import '../../styles/components/ContractSection.css';

// Remplacez par votre clé publique de test Stripe
const stripePromise = loadStripe('pk_test_51RwPc7Cz8cC4WoWZCmHaWORzwf4HD3wdG96Hg7ohQzF0fluZAATFVZkbeEQX5TuP90AjDR31McjRuCCAf9fpbUg000Mi4WYpNx');

// Définir les types de données pour une facture
interface Invoice {
  id: string;
  invoiceNumber: string;
  campaignName: string;
  issueDate: string;
  amount: number;
  amountToPay: number;
  status: 'Payée' | 'En attente' | 'En retard' | 'Annulée';
}
  
// Définir les types de données pour un contrat
interface Contract {
  id: string;
  contractNumber: string;
  campaignName: string;
  issueDate: string;
  status: 'Signé' | 'En attente de signature' | 'Annulé';
}

// Données statiques pour simuler une liste de contrats
const DUMMY_CONTRACTS: Contract[] = [
  {
    id: 'cont-1',
    contractNumber: 'CONT-2024-001',
    campaignName: 'Campagne de Noël',
    issueDate: '10/12/2024',
    status: 'Signé',
  },
  {
    id: 'cont-2',
    contractNumber: 'CONT-2024-002',
    campaignName: "Lancement d'été",
    issueDate: '25/08/2024',
    status: 'En attente de signature',
  },
  {
    id: 'cont-3',
    contractNumber: 'CONT-2024-003',
    campaignName: 'Offre Spéciale Printemps',
    issueDate: '25/03/2024',
    status: 'Annulé',
  },
];

const Facturation = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [billingInfo, setBillingInfo] = useState<{ totalDue: number; totalPaid: number }>({ totalDue: 0, totalPaid: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contracts = DUMMY_CONTRACTS;

  // Fetch invoices and billing info from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch invoices
        const invoicesResponse = await fetch('http://localhost:4242/api/annonceur/factures', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!invoicesResponse.ok) throw new Error('Failed to fetch invoices');
        const invoicesData = await invoicesResponse.json();
        setInvoices(invoicesData);

        // Fetch billing info
        const billingResponse = await fetch('http://localhost:4242/api/annonceur/facturation', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!billingResponse.ok) throw new Error('Failed to fetch billing info');
        const billingData = await billingResponse.json();
        setBillingInfo(billingData);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fonction pour déterminer la classe de style du statut de la facture
  const getInvoiceStatusClass = (status: Invoice['status']) => {
    switch (status) {
      case 'Payée': return 'status-paid';
      case 'En attente': return 'status-pending';
      case 'En retard': return 'status-overdue';
      case 'Annulée': return 'status-cancelled';
      default: return '';
    }
  };

  // Fonction pour déterminer la classe de style du statut du contrat
  const getContractStatusClass = (status: Contract['status']) => {
    switch (status) {
      case 'Signé': return 'status-signed';
      case 'En attente de signature': return 'status-pending-signature';
      case 'Annulé': return 'status-cancelled-contract';
      default: return '';
    }
  };

  const handlePayNow = async (invoice: Invoice) => {
    const stripe = await stripePromise;
    if (!stripe) {
      console.error("Échec du chargement de Stripe.");
      return;
    }

    try {
      const response = await fetch('http://localhost:4242/create-payment-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.amount,
          campaignName: invoice.campaignName,
        }),
      });

      const session = await response.json();

      if (response.ok) {
        const result = await stripe.redirectToCheckout({
          sessionId: session.id,
        });

        if (result.error) {
          console.error("Erreur de redirection:", result.error.message);
        }
      } else {
        throw new Error(session.error || 'Erreur inconnue de l\'API backend.');
      }
    } catch (error) {
      console.error("Erreur lors de la création de la session de paiement :", error);
      alert("Une erreur est survenue. Veuillez vérifier la console pour plus de détails.");
    }
  };

  const handleDownload = async (item: Invoice | Contract) => {
    try {
      if ('contractNumber' in item) {
        alert(`Téléchargement de ${item.contractNumber}.`);
        // Add contract display logic if needed
      } else {
        const response = await fetch(`http://localhost:4242/api/annonceur/download-invoice/${item.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Échec de la récupération des détails de la facture');
        }

        const invoiceData = await response.json();

        // Open a new window with invoice details
        const invoiceWindow = window.open('', '_blank');
        if (invoiceWindow) {
          invoiceWindow.document.write(`
            <!DOCTYPE html>
            <html lang="fr">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Facture ${item.invoiceNumber}</title>
              <style>
                body {
                  font-family: 'Inter', sans-serif;
                  color: #1f2937;
                  padding: 2rem;
                  max-width: 800px;
                  margin: 0 auto;
                  background-color: #f9fafb;
                }
                .invoice-container {
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
              <div class="invoice-container">
                <h1>Facture</h1>
                <div class="info-section">
                  <p><strong>N° de Facture:</strong> ${item.invoiceNumber}</p>
                  <p><strong>Date d'émission:</strong> ${invoiceData.issueDate}</p>
                </div>
                <div class="section-title">Détails de la Facture</div>
                <table>
                  <thead>
                    <tr>
                      <th>Champ</th>
                      <th>Valeur</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Campagne</td>
                      <td>${invoiceData.campaignName}</td>
                    </tr>
                    <tr>
                      <td>Date d'émission</td>
                      <td>${invoiceData.issueDate}</td>
                    </tr>
                    <tr>
                      <td>Montant Total</td>
                      <td>${invoiceData.amount} DT</td>
                    </tr>
                    <tr>
                      <td>Montant à Payer (Distributeur)</td>
                      <td>${invoiceData.amountToPay} DT</td>
                    </tr>
                  </tbody>
                </table>
                <div class="footer">
                  <p><strong>Termes de paiement:</strong> Paiement dû dans les 30 jours suivant la date d'émission. Veuillez effectuer le paiement par virement bancaire à l'ordre de CarryAds.</p>
                  <p><strong>Note:</strong> Cette facture est générée automatiquement. Pour toute question, contactez-nous à contact@carryads.com.</p>
                </div>
              </div>
            </body>
            </html>
          `);
          invoiceWindow.document.close();
        } else {
          alert('Échec de l\'ouverture de la fenêtre. Vérifiez les paramètres de blocage des pop-ups.');
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'affichage de la facture:', error);
      alert('Une erreur est survenue lors de l\'affichage de la facture.');
    }
  };

  const handleSignContract = async (contract: Contract) => {
    try {
      const userEmail = 'fekihnermine1@gmail.com';
      const userName = 'Nermine';

      const response = await fetch('http://localhost:4242/create-signing-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          contractNumber: contract.contractNumber,
          campaignName: contract.campaignName,
          userEmail: userEmail,
          userName: userName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        window.open(data.signingUrl, '_blank');
      } else if (data.error === 'Consent required for DocuSign JWT authentication') {
        alert(`Please grant consent by visiting: ${data.consentUrl}`);
      } else {
        throw new Error(data.error || 'Failed to create signing session.');
      }
    } catch (error: unknown) {
      console.error('Error signing the contract:', error);
      let message = 'An unknown error occurred.';
      let details = '';
      if (error instanceof Error) {
        message = error.message;
      }
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response: unknown }).response === 'object' &&
        (error as { response: { data?: unknown } }).response?.data
      ) {
        const responseData = (error as { response: { data?: unknown } }).response.data;
        details = JSON.stringify(responseData);
        console.error('Response Data:', responseData);
      }
      alert(`An error occurred: ${message}. Details: ${details || JSON.stringify(error)}`);
    }
  };

  const hasInvoices = invoices.length > 0;
  const hasContracts = contracts.length > 0;

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
        <h1 className="page-title">Billing</h1>
        <p className="page-subtitle">View your payment history and manage your invoices.</p>
      </div>
      <button className="manage-payment-btn" onClick={() => console.log('Button not functional')}>
        <FaRegCreditCard className="btn-icon" />
        Manage Payment Methods
      </button>
    </div>

    <div className="stats-summary-container">
      <motion.div className="stat-card" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <div className="stat-icon-wrapper due-icon"><FaCreditCard /></div>
        <div className="stat-content">
          <span className="stat-title">Total Due Balance</span>
          <span className="stat-value">{billingInfo.totalDue.toLocaleString()} DT</span>
        </div>
      </motion.div>
      <motion.div className="stat-card" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.2 }}>
        <div className="stat-icon-wrapper paid-icon"><FaExchangeAlt /></div>
        <div className="stat-content">
          <span className="stat-title">Total Paid Amount</span>
          <span className="stat-value">{billingInfo.totalPaid.toLocaleString()} DT</span>
        </div>
      </motion.div>
    </div>

    <div className="table-section">
      <h2 className="section-title">Invoice History</h2>
      <AnimatePresence mode="wait">
        {hasInvoices ? (
          <motion.div
            key="table-invoices"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="invoices-table-container"
          >
            <table className="invoices-table">
              <thead>
                <tr>
                  <th>Invoice No.</th>
                  <th>Campaign</th>
                  <th>Issue Date</th>
                  <th>Amount</th>
                  <th>Amount to Pay</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <motion.tr key={invoice.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                    <td>{invoice.invoiceNumber}</td>
                    <td>{invoice.campaignName}</td>
                    <td>{invoice.issueDate}</td>
                    <td>{invoice.amount.toLocaleString()} DT</td>
                    <td>{invoice.amountToPay.toLocaleString()} DT</td>
                    <td><span className={`status-badge ${getInvoiceStatusClass(invoice.status)}`}>{invoice.status}</span></td>
                    <td>
                      <div className="action-buttons">
                        {invoice.status === 'En attente' || invoice.status === 'En retard' ? (
                          <>
                            <button className="action-btn pay-btn" onClick={() => handlePayNow(invoice)} title="Pay Now">
                              <FaCreditCard />
                            </button>
                            <button className="action-btn download-btn" onClick={() => handleDownload(invoice)} title="View Invoice">
                              <FaDownload />
                            </button>
                          </>
                        ) : (
                          <button className="action-btn download-btn" onClick={() => handleDownload(invoice)} title="View Invoice">
                            <FaDownload />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        ) : (
          <motion.div
            key="no-invoices"
            className="no-invoices-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <FaRegFilePdf className="no-invoices-icon" />
            <h2 className="no-invoices-title">No invoices found.</h2>
            <p className="no-invoices-text">Your invoices will appear here once your campaigns start generating costs.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    <div className="table-section contracts-section">
      <h2 className="section-title">Contract Management</h2>
      <AnimatePresence mode="wait">
        {hasContracts ? (
          <motion.div
            key="contracts-table"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="contracts-table-container"
          >
            <table className="contracts-table">
              <thead>
                <tr>
                  <th>Contract No.</th>
                  <th>Campaign</th>
                  <th>Issue Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract) => (
                  <motion.tr key={contract.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                    <td>{contract.contractNumber}</td>
                    <td>{contract.campaignName}</td>
                    <td>{contract.issueDate}</td>
                    <td>
                      <span className={`status-badge ${getContractStatusClass(contract.status)}`}>
                        {contract.status === 'Signé' && <FaCheckCircle />}
                        {contract.status === 'Annulé' && <FaTimesCircle />}
                        {contract.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {contract.status === 'En attente de signature' ? (
                          <button className="action-btn sign-btn" onClick={() => handleSignContract(contract)} title="Sign Contract">
                            <FaFileSignature />
                          </button>
                        ) : (
                          <button className="action-btn download-btn" onClick={() => handleDownload(contract)} title="Download Contract">
                            <FaDownload />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        ) : (
          <motion.div
            key="no-contracts"
            className="no-contracts-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <FaFileSignature className="no-contracts-icon" />
            <h2 className="no-contracts-title">No pending contracts.</h2>
            <p className="no-contracts-text">Your contracts will appear here once they are ready to be signed or downloaded.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </motion.div>
);
};
export default Facturation;