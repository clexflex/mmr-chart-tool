export const SMR_FIGURE_CARD_CHROME = {
  paddingX: 12,
  paddingY: 8,
  titleReserve: 40,
  pieGap: 14,
  minLegendWidth: 132,
  preferredLegendWidth: 152,
  maxLegendWidth: 168,
} as const;

type StandaloneFigureInput = {
  width: number;
  height: number;
  requestedChartSize: number;
  requestedPlotHeight: number;
  seriesCount?: number;
};

export function fitStandalonePieLayout(input: StandaloneFigureInput) {
  const scale = resolveSmrFigureScale(input.width);
  const availableWidth = Math.max(220, input.width - SMR_FIGURE_CARD_CHROME.paddingX * 2 * scale);
  const availableHeight = Math.max(
    160,
    input.height -
      SMR_FIGURE_CARD_CHROME.paddingY * 2 * scale -
      SMR_FIGURE_CARD_CHROME.titleReserve * scale
  );
  const gap = Math.round(SMR_FIGURE_CARD_CHROME.pieGap * scale);
  const legendItemWidth = Math.max(
    Math.round(SMR_FIGURE_CARD_CHROME.minLegendWidth * scale),
    Math.min(
      Math.round(SMR_FIGURE_CARD_CHROME.preferredLegendWidth * scale),
      Math.round(SMR_FIGURE_CARD_CHROME.maxLegendWidth * scale)
    )
  );
  const seriesCount = Math.max(1, input.seriesCount ?? 5);
  const legendColumns = Math.max(1, Math.min(seriesCount, Math.floor(availableWidth / legendItemWidth) || 1));
  const legendRows = Math.max(1, Math.ceil(seriesCount / legendColumns));
  const legendRowHeight = Math.round(24 * scale);
  const legendHeight = legendRows * legendRowHeight + (legendRows - 1) * Math.round(8 * scale);
  const shellSize = Math.max(
    160,
    Math.min(
      input.requestedChartSize,
      input.requestedPlotHeight,
      Math.max(160, availableHeight - legendHeight - gap),
      availableWidth
    )
  );

  return {
    scale,
    gap,
    shellSize,
    legendItemWidth,
    legendColumns,
    legendBlockWidth: legendColumns * legendItemWidth,
  };
}

export function fitStandaloneSideLegendPieLayout(input: StandaloneFigureInput) {
  const scale = resolveSmrFigureScale(input.width);
  const availableWidth = Math.max(220, input.width - SMR_FIGURE_CARD_CHROME.paddingX * 2 * scale);
  const availableHeight = Math.max(
    160,
    input.height -
      SMR_FIGURE_CARD_CHROME.paddingY * 2 * scale -
      SMR_FIGURE_CARD_CHROME.titleReserve * scale
  );
  const gap = Math.round(SMR_FIGURE_CARD_CHROME.pieGap * scale);
  const legendWidth = Math.round(SMR_FIGURE_CARD_CHROME.maxLegendWidth * scale);
  const shellSize = Math.max(
    160,
    Math.min(
      input.requestedChartSize,
      input.requestedPlotHeight,
      availableHeight,
      Math.max(160, availableWidth - legendWidth - gap)
    )
  );

  return {
    scale,
    gap,
    shellSize,
    legendWidth,
    groupWidth: shellSize + gap + legendWidth,
  };
}

export function fitStandaloneColumnLayout(input: StandaloneFigureInput) {
  const scale = resolveSmrFigureScale(input.width);
  const availableWidth = Math.max(280, input.width - SMR_FIGURE_CARD_CHROME.paddingX * 2 * scale);
  const availableHeight = Math.max(
    160,
    input.height -
      SMR_FIGURE_CARD_CHROME.paddingY * 2 * scale -
      SMR_FIGURE_CARD_CHROME.titleReserve * scale
  );
  const aspectRatio = 460 / 196;
  const stageWidth = Math.min(
    input.requestedChartSize,
    availableWidth,
    availableHeight * aspectRatio,
    input.requestedPlotHeight * aspectRatio
  );
  const stageHeight = stageWidth / aspectRatio;

  return {
    scale,
    stageWidth: Math.floor(stageWidth),
    stageHeight: Math.round(stageHeight),
  };
}

function resolveSmrFigureScale(width: number) {
  return Math.min(1.12, Math.max(1, width / 600));
}
