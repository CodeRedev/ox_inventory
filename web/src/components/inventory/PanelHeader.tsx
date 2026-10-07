import React from 'react';
import WeightBar from '../utils/WeightBar';

type IconName = 'hand' | 'pockets' | 'ground' | 'box';

const ICONS: Record<IconName, React.ReactNode> = {
  hand: (
    <>
      <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
      <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
      <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </>
  ),
  pockets: (
    <>
      <path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M8 21v-5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5" />
      <path d="M8 10h8" />
    </>
  ),
  ground: (
    <>
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </>
  ),
  box: (
    <>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </>
  ),
};

const GridIcon = () => (
  <svg viewBox="0 0 24 24" className="panel-meta-icon" fill="none" strokeWidth="2" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const BagIcon = () => (
  <svg viewBox="0 0 24 24" className="panel-meta-icon" fill="none" strokeWidth="2" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

interface Props {
  icon: IconName;
  title: string;
  subtitle?: string;
  meta?: React.ReactNode;
  metaIcon?: 'grid' | 'bag';
  percent?: number;
  segments?: number;
}

const PanelHeader: React.FC<Props> = ({ icon, title, subtitle, meta, metaIcon = 'bag', percent = 0, segments = 5 }) => (
  <div className="panel-header">
    <div className="panel-icon">
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {ICONS[icon]}
      </svg>
    </div>
    <div className="panel-titles">
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
    {meta !== undefined && (
      <div className="panel-meta">
        <div className="panel-meta-row">
          <span>{meta}</span>
          {metaIcon === 'grid' ? <GridIcon /> : <BagIcon />}
        </div>
        <WeightBar percent={percent} segments={segments} />
      </div>
    )}
  </div>
);

export default PanelHeader;