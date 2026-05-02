import { useState, useEffect } from 'react';

export const Loader = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would wait for actual data to load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="loader-screen" id="loaderScreen">
        <div className="loader-logo"><i className="fas fa-heartbeat"></i> MediShop Pro</div>
        <div className="loader-bar"><div className="loader-bar__fill"></div></div>
        <div className="loader-text">Loading premium medical equipment...</div>
    </div>
  );
};
