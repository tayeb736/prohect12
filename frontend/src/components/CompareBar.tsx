import { useAppContext } from '../context/AppContext';

export const CompareBar = () => {
  const { compareList, setCompareList } = useAppContext();

  if (compareList.length === 0) return null;

  const handleClear = () => {
    setCompareList([]);
    localStorage.setItem('ms_compare', JSON.stringify([]));
  };

  const handleCompare = () => {
    // Navigate to compare page or open modal
    alert(`Comparing ${compareList.length} products: ${compareList.join(', ')}`);
  };

  return (
    <div className="compare-bar show" id="compareBar">
      <span className="compare-bar__text">
        <i className="fas fa-balance-scale"></i> 
        <span id="compareCount">{compareList.length}</span> products selected for comparison
      </span>
      <div className="compare-bar__actions">
        <button className="compare-bar__btn compare-bar__btn--clear" onClick={handleClear}>Clear All</button>
        <button className="compare-bar__btn compare-bar__btn--primary" onClick={handleCompare}>Compare Now</button>
      </div>
    </div>
  );
};
