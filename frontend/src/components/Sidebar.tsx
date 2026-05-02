import { useAppContext } from '../context/AppContext';
import { useState } from 'react';

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

export const Sidebar = () => {
  const { isSideNavOpen, setIsSideNavOpen, activeCategory, setActiveCategory, categories } = useAppContext();
  const [openSubs, setOpenSubs] = useState<Record<string, boolean>>({});

  const closeSidebar = () => setIsSideNavOpen(false);

  const toggleSub = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenSubs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const selectCategory = (id: string) => {
    setActiveCategory(id);
    closeSidebar();
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  const displayCategories = categories && categories.length > 0 
    ? [{ id: 'all', name: 'All Products', icon: 'fa-th-large' }, ...categories.map(c => ({
        id: c.name,
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

  return (
    <>
      <aside className={`side-nav ${isSideNavOpen ? 'open' : ''}`} id="sideNav">
        <div className="side-nav__overlay" id="sideNavOverlay" onClick={closeSidebar}></div>
        
        <div className="side-nav__trigger" id="sideNavTrigger" onClick={() => setIsSideNavOpen(!isSideNavOpen)}>
            <div className="side-nav__trigger-pulse"></div>
            <span className="side-nav__trigger-icon"><i className="fas fa-chevron-right"></i> CATEGORIES</span>
        </div>

        <div className="side-nav__close" id="sideNavClose" onClick={closeSidebar}><i className="fas fa-times"></i></div>

        <div className="side-nav__header">
            <i className="fas fa-heartbeat"></i>
            <div className="side-nav__header-text">
                <h3>MediShop Pro</h3>
                <p>Your Medical Equipment Partner</p>
            </div>
        </div>

        <div className="side-nav__body">
            <div className="side-nav__quick-actions">
                <div className="side-nav__quick-action">
                    <i className="fas fa-fire"></i>
                    <span>Flash Deals</span>
                </div>
                <div className="side-nav__quick-action">
                    <i className="fas fa-shopping-cart"></i>
                    <span>My Cart</span>
                </div>
                <div className="side-nav__quick-action">
                    <i className="fas fa-headset"></i>
                    <span>Support</span>
                </div>
                <div className="side-nav__quick-action">
                    <i className="fas fa-truck"></i>
                    <span>Track Order</span>
                </div>
            </div>

            <div className="side-nav__section">
                <div className="side-nav__section-title">Main Categories</div>
                
                {displayCategories.map(cat => (
                  <div key={cat.id}>
                    <div 
                      className={`side-nav__item ${activeCategory === cat.id ? 'active' : ''}`} 
                      onClick={() => selectCategory(cat.id)}
                    >
                        <div className="side-nav__item-icon"><i className={`fas ${cat.icon}`}></i></div>
                        <div className="side-nav__item-text">
                          <div className="side-nav__item-name">{cat.name}</div>
                        </div>
                    </div>
                  </div>
                ))}

            </div>
        </div>

        <div className="side-nav__footer">
            <div className="side-nav__footer-promo">
                <div className="side-nav__footer-promo-icon">🎁</div>
                <div className="side-nav__footer-promo-text">Get 10% OFF your first order!</div>
                <div className="side-nav__footer-promo-code" title="Click to copy" onClick={() => alert('Copied!')}>MEDISHOP10</div>
            </div>
            <div className="side-nav__footer-contact">
                <div className="side-nav__footer-contact-item"><i className="fas fa-phone"></i> +213 555 123 456</div>
                <div className="side-nav__footer-contact-item"><i className="fas fa-envelope"></i> contact@medishop-pro.dz</div>
                <div className="side-nav__footer-contact-item"><i className="fas fa-clock"></i> Mon-Fri: 8AM-7PM</div>
            </div>
        </div>
      </aside>
    </>
  );
};
