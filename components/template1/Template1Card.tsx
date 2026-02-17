import { forwardRef } from "react";
import type { Template1ViewModel } from "@/lib/template1/types";
import { HeaderRow } from "./HeaderRow";
import { RegionPieChart } from "./charts/RegionPieChart";
import { TypeHorizontalBarChart } from "./charts/TypeHorizontalBarChart";
import { YearlyColumnChart } from "./charts/YearlyColumnChart";

type Template1CardProps = {
  viewModel: Template1ViewModel;
  unit: string;
};

export const Template1Card = forwardRef<HTMLDivElement, Template1CardProps>(function Template1Card(
  { viewModel, unit },
  ref
) {
  return (
    <div className="t1-card" ref={ref}>
      <HeaderRow
        marketTitle={viewModel.text.mainTitle}
        headerDominance={viewModel.text.headerDominance}
        headerCagrLead={viewModel.text.headerCagrLead}
        headerCagrBody={viewModel.text.headerCagrBody}
      />

      <h2 className="t1-main-title">
        <span>{viewModel.text.mainTitle}</span>
      </h2>

      <YearlyColumnChart title={viewModel.text.yearlyTitle} data={viewModel.years} unit={unit} />

      <div className="t1-bottom-row">
        <TypeHorizontalBarChart title={viewModel.text.typeTitle} data={viewModel.typeSeries} />
        <RegionPieChart title={viewModel.text.regionTitle} data={viewModel.regionSeries} />
      </div>
    </div>
  );
});
