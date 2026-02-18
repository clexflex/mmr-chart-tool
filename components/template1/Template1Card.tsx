import { forwardRef } from "react";
import type { DensityMode, Template1ViewModel } from "@/lib/template1/types";
import { HeaderRow } from "./HeaderRow";
import { RegionPieChart } from "./charts/RegionPieChart";
import { TypeHorizontalBarChart } from "./charts/TypeHorizontalBarChart";
import { YearlyColumnChart } from "./charts/YearlyColumnChart";

type Template1CardProps = {
  viewModel: Template1ViewModel;
  unit: string;
  width: number;
  height: number;
  backgroundColor: string;
  density: DensityMode;
  chartHeights: {
    yearlyPlot: number;
    typeChart: number;
    regionChart: number;
  };
};

export const Template1Card = forwardRef<HTMLDivElement, Template1CardProps>(function Template1Card(
  { viewModel, unit, width, height, backgroundColor, density, chartHeights },
  ref
) {
  return (
    <div className={`t1-card t1-card-${density}`} ref={ref} style={{ width, height, backgroundColor }}>
      <HeaderRow
        headerDominance={viewModel.text.headerDominance}
        headerCagrLead={viewModel.text.headerCagrLead}
        headerCagrBody={viewModel.text.headerCagrBody}
      />

      <h2 className="t1-main-title">{viewModel.text.mainTitle}</h2>

      <YearlyColumnChart
        title={viewModel.text.yearlyTitle}
        data={viewModel.years}
        unit={unit}
        plotHeight={chartHeights.yearlyPlot}
      />

      <div className="t1-bottom-row">
        <TypeHorizontalBarChart
          title={viewModel.text.typeTitle}
          data={viewModel.typeSeries}
          chartHeight={chartHeights.typeChart}
          density={density}
        />
        <RegionPieChart
          title={viewModel.text.regionTitle}
          data={viewModel.regionSeries}
          chartHeight={chartHeights.regionChart}
          density={density}
        />
      </div>
    </div>
  );
});
