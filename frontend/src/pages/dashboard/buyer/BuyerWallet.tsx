import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import './BuyerWallet.css';

const BuyerWallet: React.FC = () => {
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await api.get('/wallet/my-wallet');
        setWallet(res.data);
      } catch (err) {
        console.error('Failed to fetch buyer wallet:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, []);

  const formatPrice = (p: number) => new Intl.NumberFormat('fr-DZ').format(Math.round(p)) + ' DZD';

  if (loading) return <div>Loading wallet...</div>;

  return (
    <div className="buyer-wallet">
      <div className="page-header">
        <h1>My Wallet</h1>
        <p>Manage your payment methods and view transaction history.</p>
      </div>

      <div className="wallet-overview">
        <div className="balance-card">
          <div className="card-top">
            <div className="label">Available Balance</div>
            <div className="balance">{formatPrice(wallet?.balance || 0)}</div>
          </div>
          <div className="card-bottom">
            <button className="add-funds-btn" onClick={() => alert('Add funds feature coming soon')}><i className="fas fa-plus"></i> Add Funds</button>
          </div>
        </div>

        <div className="payment-methods">
          <h3>Saved Payment Methods</h3>
          <div className="card-item">
            <div className="card-brand"><i className="fab fa-cc-visa"></i></div>
            <div className="card-details">
              <span>Visa Card</span>
              <small>•••• •••• •••• 4242</small>
            </div>
            <button className="remove-btn">Remove</button>
          </div>
          <button className="add-card-btn"><i className="fas fa-plus-circle"></i> Add New Card</button>
        </div>
      </div>

      <div className="recent-payments">
        <h3>Recent Transactions</h3>
        <div className="payment-list">
          {wallet?.transactions?.length === 0 ? (
            <div style={{textAlign: 'center', padding: '1rem'}}>No transactions found.</div>
          ) : (
            wallet?.transactions?.map((tx: any) => (
              <div className="payment-row" key={tx.id}>
                <div className="pay-info">
                  <strong>{tx.description || tx.type}</strong>
                  <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
                </div>
                <div className={`pay-amount ${tx.type === 'REFUND' || tx.type === 'DEPOSIT_REFUND' ? 'success' : ''}`}>
                  {tx.type === 'REFUND' || tx.type === 'DEPOSIT_REFUND' ? '+' : '-'}{formatPrice(tx.amount)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyerWallet;
