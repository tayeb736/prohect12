import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import './SellerWallet.css';

const SellerWallet: React.FC = () => {
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const fetchWallet = async () => {
    try {
      const res = await api.get('/wallet/my-wallet');
      setWallet(res.data);
    } catch (err) {
      console.error('Failed to fetch wallet:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleWithdraw = async () => {
    if (!withdrawAmount || isNaN(Number(withdrawAmount)) || Number(withdrawAmount) <= 0) {
      return alert('Enter a valid amount');
    }
    if (Number(withdrawAmount) > (wallet?.balance || 0)) {
      return alert('Insufficient balance');
    }

    try {
      const res = await api.post('/wallet/withdraw', { amount: Number(withdrawAmount) });
      setWallet(res.data);
      setWithdrawAmount('');
      alert('Withdrawal request submitted successfully.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Withdrawal failed');
    }
  };

  const formatPrice = (p: number) => new Intl.NumberFormat('fr-DZ').format(Math.round(p)) + ' DZD';

  if (loading) return <div>Loading wallet...</div>;

  const totalEarned = (wallet?.balance || 0) + (wallet?.transactions || [])
    .filter((t: any) => t.type === 'WITHDRAWAL' && t.status === 'PAID')
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  return (
    <div className="seller-wallet">
      <div className="page-header">
        <h1>Financial Overview</h1>
        <button 
          className="withdraw-btn" 
          onClick={() => {
            const amount = prompt('Enter amount to withdraw (DZD):');
            if (amount) {
               const rib = prompt('Enter your Bank Account Number (RIP/RIB):');
               if (rib) {
                 setWithdrawAmount(amount);
                 // Simulating the submit for MVP since setWithdrawAmount triggers next render, we call API directly
                 api.post('/wallet/withdraw', { amount: Number(amount), account: rib })
                   .then(res => { setWallet(res.data); alert('Withdrawal requested successfully!'); })
                   .catch(err => alert(err.response?.data?.message || 'Withdrawal failed.'));
               }
            }
          }}
          style={{background: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}
        >
          <i className="fas fa-money-check-alt"></i> Request Withdrawal
        </button>
      </div>

      <div className="wallet-cards">
        <div className="w-card total">
          <div className="w-icon"><i className="fas fa-wallet"></i></div>
          <div className="w-info">
            <span>Available Balance</span>
            <strong>{formatPrice(wallet?.balance || 0)}</strong>
          </div>
        </div>
        <div className="w-card pending">
          <div className="w-icon"><i className="fas fa-clock"></i></div>
          <div className="w-info">
            <span>Pending Earnings</span>
            <strong>{formatPrice(wallet?.pendingBalance || 0)}</strong>
          </div>
        </div>
        <div className="w-card earned">
          <div className="w-icon"><i className="fas fa-chart-line"></i></div>
          <div className="w-info">
            <span>Total Earned</span>
            <strong>{formatPrice(totalEarned)}</strong>
          </div>
        </div>
      </div>

      <div className="transaction-history">
        <div className="card-header">
          <h2>Recent Transactions</h2>
          <button className="btn-text">Download Report</button>
        </div>
        <div className="transactions-table">
          <table>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {wallet?.transactions?.length === 0 ? (
                <tr><td colSpan={5} style={{textAlign: 'center'}}>No transactions yet</td></tr>
              ) : (
                wallet?.transactions?.map((tx: any) => (
                  <tr key={tx.id}>
                    <td>{tx.id.substring(0, 8).toUpperCase()}</td>
                    <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                    <td><span className={`tx-type ${tx.type.toLowerCase()}`}>{tx.type}</span></td>
                    <td><strong className={tx.type === 'WITHDRAWAL' ? 'text-danger' : 'text-success'}>
                      {tx.type === 'WITHDRAWAL' ? '-' : '+'}{formatPrice(tx.amount)}
                    </strong></td>
                    <td><span className={`tx-status ${tx.status.toLowerCase()}`}>{tx.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SellerWallet;
