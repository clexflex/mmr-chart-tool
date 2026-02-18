import { forwardRef } from "react";
import { HeaderRow } from "@/components/template1/HeaderRow";
import { RegionPieChart } from "@/components/template1/charts/RegionPieChart";
import { TypeHorizontalBarChart } from "@/components/template1/charts/TypeHorizontalBarChart";
import { MarketSizeTable } from "@/components/template3/MarketSizeTable";
import { StackedShareBar } from "@/components/template3/charts/StackedShareBar";
import type { DensityMode, Template2ViewModel } from "@/lib/template1/types";

type Template2CardProps = {
  viewModel: Template2ViewModel;
  width: number;
  height: number;
  backgroundColor: string;
  density: DensityMode;
  chartHeights: {
    topSegment: number;
    bottomLeft: number;
    bottomRight: number;
  };
};

export const Template2Card = forwardRef<HTMLDivElement, Template2CardProps>(function Template2Card(
  { viewModel, width, height, backgroundColor, density, chartHeights },
  ref
) {
  return (
    <div className={`t2-card t2-card-${density}`} ref={ref} style={{ width, height, backgroundColor }}>
      <HeaderRow
        headerDominance={viewModel.text.headerDominance}
        headerCagrLead={viewModel.text.headerCagrLead}
        headerCagrBody={viewModel.text.headerCagrBody}
      />

      <h2 className="t1-main-title">{viewModel.text.mainTitle}</h2>

      <div className="t2-top-row">
        <StackedShareBar
          title={viewModel.text.topSegmentTitle}
          data={viewModel.topStackSeries}
          chartHeight={chartHeights.topSegment}
          density={density}
        />
        <MarketSizeTable
          marketTitle={viewModel.text.mainTitle}
          value2025={viewModel.marketSize.value2025}
          value2032={viewModel.marketSize.value2032}
          unit={viewModel.marketSize.unit}
        />
      </div>

      <div className="t2-bottom-row">
        <RegionPieChart
          title={viewModel.text.pieTitle}
          data={viewModel.pieSeries}
          chartHeight={chartHeights.bottomLeft}
          density={density}
        />
        <TypeHorizontalBarChart
          title={viewModel.text.horizontalTitle}
          data={viewModel.horizontalSeries}
          chartHeight={chartHeights.bottomRight}
          density={density}
        />
      </div>
    </div>
  );
});
