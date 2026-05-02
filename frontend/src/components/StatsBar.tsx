import { useEffect, useRef, useState } from 'react';

const StatItem = ({ icon, endCount, label, suffix = '' }: { icon: string, endCount: number, label: string, suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        let current = 0;
        const duration = 2000;
        const step = Math.ceil(endCount / (duration / 16));
        const timer = setInterval(() => {
          current += step;
          if (current >= endCount) {
            setCount(endCount);
            clearInterval(timer);
          } else {
            setCount(current);
          }
        }, 16);
        observer.disconnect();
      }
    });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [endCount]);

  return (
    <div className="stat-item" ref={ref}>
      <div className="stat-item__icon"><i className={`fas ${icon}`}></i></div>
      <div className="stat-item__number">{count}{suffix}</div>
      <div className="stat-item__label">{label}</div>
    </div>
  );
};

export const StatsBar = () => {
  return (
    <section className="stats-bar">
      <div className="container">
        <div className="stats-grid">
          <StatItem icon="fa-box-open" endCount={10000} label="Products Available" suffix="+" />
          <StatItem icon="fa-hospital" endCount={5200} label="Hospitals Served" suffix="+" />
          <StatItem icon="fa-truck-fast" endCount={48} label="Wilayas Covered" />
          <StatItem icon="fa-star" endCount={98} label="% Satisfaction Rate" />
        </div>
      </div>
    </section>
  );
};
