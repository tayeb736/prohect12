import { useAppContext } from '../context/AppContext';

// Mapping of known categories to icons, fallback to fa-box
const categoryIcons: { [key: string]: string } = {
  'Diagnostics': 'fa-stethoscope',
  'Surgical': 'fa-scalpel-line-dashed',
  'Disposables': 'fa-box-tissue',
  'Mobility': 'fa-wheelchair',
  'Rehabilitation': 'fa-person-walking',
  'Laboratory': 'fa-flask',
  'Respiratory': 'fa-lungs',
  'Furniture': 'fa-bed',
  'Hospital Furniture': 'fa-bed',
  'Dental': 'fa-tooth',
  'Emergency': 'fa-kit-medical',
  'Imaging': 'fa-x-ray',
  'Storage': 'fa-snowflake',
  'Cold Storage': 'fa-snowflake',
  'Sterilization': 'fa-shield-virus',
  'Testing': 'fa-vials',
  'Testing Kits': 'fa-vials',
  'Hygiene': 'fa-hands-bubbles',
  'Equipment': 'fa-gears',
  'Neonatal': 'fa-baby'
};

export const Categories = () => {
  const { categories, activeCategory, setActiveCategory } = useAppContext();

  // If backend returns empty categories, fallback to a static list to maintain design
  const displayCategories = categories && categories.length > 0 
    ? [{ id: 'all', name: 'All Products', icon: 'fa-th-large' }, ...categories.map(c => ({
        id: c.name, // assuming backend uses name as identifier or we map it
        name: c.name,
        icon: c.icon || categoryIcons[c.name] || 'fa-box'
      }))]
    : [
        {id:'all',name:'All Products',icon:'fa-th-large'},
        {id:'Diagnostics',name:'Diagnostics',icon:'fa-stethoscope'},
        {id:'Surgical',name:'Surgical',icon:'fa-scalpel-line-dashed'},
        {id:'Disposables',name:'Disposables',icon:'fa-box-tissue'},
        {id:'Mobility',name:'Mobility',icon:'fa-wheelchair'},
        {id:'Rehab',name:'Rehabilitation',icon:'fa-person-walking'},
        {id:'Lab',name:'Laboratory',icon:'fa-flask'},
        {id:'Respiratory',name:'Respiratory',icon:'fa-lungs'},
        {id:'Furniture',name:'Hospital Furniture',icon:'fa-bed'},
        {id:'Dental',name:'Dental',icon:'fa-tooth'},
        {id:'Emergency',name:'Emergency',icon:'fa-kit-medical'},
        {id:'Imaging',name:'Imaging',icon:'fa-x-ray'},
        {id:'Storage',name:'Cold Storage',icon:'fa-snowflake'},
        {id:'Sterilization',name:'Sterilization',icon:'fa-shield-virus'},
        {id:'Testing',name:'Testing Kits',icon:'fa-vials'},
        {id:'Hygiene',name:'Hygiene',icon:'fa-hands-bubbles'},
        {id:'Equipment',name:'Equipment',icon:'fa-gears'},
        {id:'Neonatal',name:'Neonatal',icon:'fa-baby'}
      ];

  const handleCategoryClick = (catId: string) => {
    setActiveCategory(catId);
    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="categories container">
      <h2 className="categories__title">Explore by <span>Category</span></h2>
      <div className="categories__grid">
        {displayCategories.map((c) => (
          <div 
            key={c.id}
            className={`category-card ${activeCategory === c.id ? 'active' : ''}`}
            onClick={() => handleCategoryClick(c.id)}
          >
            <div className="category-card__icon">
              <i className={`fas ${c.icon}`}></i>
            </div>
            <div className="category-card__name">{c.name}</div>
          </div>
        ))}
      </div>
    </section>
  );
};
