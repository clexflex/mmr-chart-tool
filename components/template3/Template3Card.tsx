import { forwardRef } from "react";
import type { DensityMode, Template3ViewModel } from "@/lib/template1/types";
import { HeaderRow } from "@/components/template1/HeaderRow";
import { RegionPieChart } from "@/components/template1/charts/RegionPieChart";
import { MarketSizeTable } from "./MarketSizeTable";
import { StackedShareBar } from "./charts/StackedShareBar";
import { VerticalSegmentChart } from "./charts/VerticalSegmentChart";

type Template3CardProps = {
  viewModel: Template3ViewModel;
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

export const Template3Card = forwardRef<HTMLDivElement, Template3CardProps>(function Template3Card(
  { viewModel, width, height, backgroundColor, density, chartHeights },
  ref
) {
  return (
    <div className={`t3-card t3-card-${density}`} ref={ref} style={{ width, height, backgroundColor }}>
      <HeaderRow
        headerDominance={viewModel.text.headerDominance}
        headerCagrLead={viewModel.text.headerCagrLead}
        headerCagrBody={viewModel.text.headerCagrBody}
      />

      <h2 className="t1-main-title">{viewModel.text.mainTitle}</h2>

      <div className="t3-top-row">
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

      <div className="t3-bottom-row">
        <RegionPieChart
          title={viewModel.text.pieTitle}
          data={viewModel.pieSeries}
          chartHeight={chartHeights.bottomLeft}
          density={density}
        />
        <VerticalSegmentChart
          title={viewModel.text.verticalTitle}
          data={viewModel.verticalSeries}
          chartHeight={chartHeights.bottomRight}
          density={density}
        />
      </div>
    </div>
  );
});
