import type { SegmentationTableViewModel } from "@/lib/template1/types";

type SegmentationTablePreviewProps = {
  viewModel: SegmentationTableViewModel;
  html: string;
};

export function SegmentationTablePreview({ viewModel, html }: SegmentationTablePreviewProps) {
  return (
    <section className="sgt-preview">
      <h3 className="sgt-preview-title">Segmentation Table Preview ({viewModel.styleMode})</h3>
      <div className="sgt-preview-body" dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
}
