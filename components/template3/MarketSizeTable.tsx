type MarketSizeTableProps = {
  marketTitle: string;
  value2025: number;
  value2032: number;
  unit: string;
};

export function MarketSizeTable({ marketTitle, value2025, value2032, unit }: MarketSizeTableProps) {
  return (
    <section className="t3-size-table">
      <h3 className="t3-size-title">{marketTitle} Size</h3>
      <div className="t3-size-grid">
        <div className="t3-size-year">2025</div>
        <div className="t3-size-year">2032</div>
        <div className="t3-size-value">
          {formatValue(value2025)} <span>{unit}</span>
        </div>
        <div className="t3-size-value">
          {formatValue(value2032)} <span>{unit}</span>
        </div>
      </div>
    </section>
  );
}

function formatValue(value: number): string {
  return Number(value.toFixed(2)).toString();
}
