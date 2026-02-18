import { forwardRef } from "react";
import { HeaderRow } from "@/components/template1/HeaderRow";
import { MarketSizeTable } from "@/components/template3/MarketSizeTable";
import { StackedShareBar } from "@/components/template3/charts/StackedShareBar";
import { VerticalSegmentChart } from "@/components/template3/charts/VerticalSegmentChart";
import type { DensityMode, Template4ViewModel } from "@/lib/template1/types";

type Template4CardProps = {
  viewModel: Template4ViewModel;
  width: number;
  height: number;
  backgroundColor: string;
  density: DensityMode;
  chartHeights: {
    topSegment: number;
    bottomMain: number;
  };
};

export const Template4Card = forwardRef<HTMLDivElement, Template4CardProps>(function Template4Card(
  { viewModel, width, height, backgroundColor, density, chartHeights },
  ref
) {
  return (
    <div className={`t4-card t4-card-${density}`} ref={ref} style={{ width, height, backgroundColor }}>
      <HeaderRow
        headerDominance={viewModel.text.headerDominance}
        headerCagrLead={viewModel.text.headerCagrLead}
        headerCagrBody={viewModel.text.headerCagrBody}
      />

      <h2 className="t1-main-title">{viewModel.text.mainTitle}</h2>

      <div className="t4-top-row">
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

      <div className="t4-bottom-row">
        <VerticalSegmentChart
          title={viewModel.text.verticalTitle}
          data={viewModel.verticalSeries}
          chartHeight={chartHeights.bottomMain}
          density={density}
        />
      </div>
    </div>
  );
});
