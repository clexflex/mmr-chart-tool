type TocPreviewProps = {
  html: string;
  segmentCount: number;
  keyPlayerCount: number;
  didTruncateSegments: boolean;
  didTruncateSegmentItems: boolean;
  didTruncateKeyPlayers: boolean;
};

export function TocPreview({
  html,
  segmentCount,
  keyPlayerCount,
  didTruncateSegments,
  didTruncateSegmentItems,
  didTruncateKeyPlayers,
}: TocPreviewProps) {
  return (
    <section className="toc-preview">
      <div className="toc-preview-head">
        <h3 className="toc-preview-title">TOC Preview</h3>
        <p className="toc-preview-meta">
          {segmentCount} segment{segmentCount === 1 ? "" : "s"} · {keyPlayerCount} key player{keyPlayerCount === 1 ? "" : "s"}
        </p>
      </div>
      {didTruncateSegments || didTruncateSegmentItems || didTruncateKeyPlayers ? (
        <p className="toc-preview-note">
          Template limits applied:
          {didTruncateSegments ? " max 7 segments;" : ""}
          {didTruncateSegmentItems ? " max 15 items per segment;" : ""}
          {didTruncateKeyPlayers ? " max 40 key players." : ""}
        </p>
      ) : null}
      <div className="toc-preview-body" dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
}
