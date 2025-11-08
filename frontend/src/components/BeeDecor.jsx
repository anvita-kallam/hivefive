export function BeeDecor() {
  return (
    <>
      {/* Top right honeycomb */}
      <div className="fixed top-24 right-8 opacity-10 pointer-events-none z-0">
        <HoneycombPattern scale={1} />
      </div>
      
      {/* Top left honeycomb */}
      <div className="fixed top-32 left-12 opacity-10 pointer-events-none z-0">
        <HoneycombPattern scale={0.8} />
      </div>
      
      {/* Bottom right honeycomb */}
      <div className="fixed bottom-20 right-20 opacity-10 pointer-events-none z-0">
        <HoneycombPattern scale={1.2} />
      </div>
      
      {/* Bottom left honeycomb */}
      <div className="fixed bottom-32 left-8 opacity-10 pointer-events-none z-0">
        <HoneycombPattern scale={0.9} />
      </div>

      {/* Center large honeycomb pattern */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none z-0">
        <HoneycombPattern scale={2} />
      </div>
    </>
  );
}

function HoneycombPattern({ scale = 1 }) {
  const baseSize = 120;
  const size = baseSize * scale;
  
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 120 140" fill="none" style={{ color: '#2D1B00' }}>
      <g>
        <HexagonPath x={0} y={0} />
        <HexagonPath x={52} y={0} />
        <HexagonPath x={26} y={45} />
        <HexagonPath x={78} y={45} />
        <HexagonPath x={0} y={90} />
        <HexagonPath x={52} y={90} />
      </g>
    </svg>
  );
}

function HexagonPath({ x, y }) {
  return (
    <path
      d={`M ${x + 26} ${y + 0} L ${x + 52} ${y + 15} L ${x + 52} ${y + 45} L ${x + 26} ${y + 60} L ${x + 0} ${y + 45} L ${x + 0} ${y + 15} Z`}
      stroke="#2D1B00"
      strokeWidth="2"
      fill="none"
    />
  );
}

export function BeeLogo({ className = "", width = 32, height = 32 }) {
  return (
    <img 
      src="/bee_logo.png" 
      alt="HiveFive Logo" 
      className={className}
      style={{ 
        width: `${width}px`, 
        height: `${height}px`, 
        objectFit: 'contain',
        backgroundColor: 'transparent',
        background: 'transparent'
      }}
    />
  );
}

