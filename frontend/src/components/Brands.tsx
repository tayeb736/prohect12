export const Brands = () => {
  return (
    <>
    <section className="brands-section" id="brands">
      <div className="container">
        <h3 className="brands__title" style={{ textAlign: 'center', marginBottom: '30px', fontSize: '1.5rem', fontWeight: 'bold' }}>Our Global Partners</h3>
        <div className="brands-grid" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap', opacity: 0.7 }}>
          <div className="brand-item">3M</div>
          <div className="brand-item">Littmann</div>
          <div className="brand-item">Mindray</div>
          <div className="brand-item">Philips</div>
          <div className="brand-item">GE Healthcare</div>
          <div className="brand-item">Medtronic</div>
          <div className="brand-item">Siemens</div>
          <div className="brand-item">WelchAllyn</div>
        </div>
      </div>
    </section>
    </>
  );
};
