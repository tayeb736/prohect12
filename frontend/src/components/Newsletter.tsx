export const Newsletter = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for subscribing to our newsletter!');
  };

  return (
    <>
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter__content">
            <h2 className="newsletter__title">Stay Updated with Exclusive Deals</h2>
            <p className="newsletter__text">Subscribe to our newsletter for the latest medical equipment offers, new product launches, and professional resources.</p>
            <form className="newsletter__form" onSubmit={handleSubmit}>
              <input type="email" id="newsletterEmail" placeholder="Enter your email address..." aria-label="Email" required />
              <button type="submit" id="newsletterBtn">Subscribe <i className="fas fa-paper-plane"></i></button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

