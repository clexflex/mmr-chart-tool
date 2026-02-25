import { parseIndentedHierarchy } from "@/lib/segments/parseIndentedHierarchy";
import type { SegmentRowInput } from "@/lib/template1/types";

const MAX_SEGMENTS = 7;
const MAX_SEGMENT_ITEMS = 15;
const MAX_KEY_PLAYERS = 40;

const GLOBAL_REGIONS = ["North America", "Europe", "Asia Pacific", "Middle East and Africa", "South America"];

const PROFILE_DETAILS = [
  "Company Overview",
  "Business Portfolio",
  "Financial Overview",
  "SWOT Analysis",
  "Strategic Analysis",
  "Scale of Operation (small, medium, and large)",
  "Details on Partnership",
  "Regulatory Accreditations and Certifications Received by Them",
  "Awards Received by the Firm",
  "Recent Developments",
];

type RegionalChapter = {
  chapter: number;
  region: string;
  countries: string[];
  includeSegmentItems: boolean;
  includeCountrySegmentItems: boolean;
};

const REGIONAL_CHAPTERS: RegionalChapter[] = [
  {
    chapter: 5,
    region: "North America",
    countries: ["United States", "Canada", "Mexico"],
    includeSegmentItems: true,
    includeCountrySegmentItems: true,
  },
  {
    chapter: 6,
    region: "Europe",
    countries: ["United Kingdom", "France", "Germany", "Italy", "Spain", "Sweden", "Austria", "Rest of Europe"],
    includeSegmentItems: false,
    includeCountrySegmentItems: false,
  },
  {
    chapter: 7,
    region: "Asia Pacific",
    countries: ["China", "S Korea", "Japan", "India", "Australia", "Indonesia", "Malaysia", "Vietnam", "Taiwan", "Rest of Asia Pacific"],
    includeSegmentItems: false,
    includeCountrySegmentItems: false,
  },
  {
    chapter: 8,
    region: "Middle East and Africa",
    countries: ["South Africa", "GCC", "Nigeria", "Rest of ME&A"],
    includeSegmentItems: false,
    includeCountrySegmentItems: false,
  },
  {
    chapter: 9,
    region: "South America",
    countries: ["Brazil", "Argentina", "Rest Of South America"],
    includeSegmentItems: false,
    includeCountrySegmentItems: false,
  },
];

export type TocInput = {
  marketTitle: string;
  keyPlayersRaw: string;
  segmentRows: SegmentRowInput[];
  unit: string;
};

export type TocSegment = {
  title: string;
  items: string[];
};

export type TocLine = {
  text: string;
  strong?: boolean;
  italic?: boolean;
  spacer?: boolean;
};

export type TocViewModel = {
  marketLabel: string;
  industryLabel: string;
  segments: TocSegment[];
  keyPlayers: string[];
  lines: TocLine[];
  didTruncateSegments: boolean;
  didTruncateSegmentItems: boolean;
  didTruncateKeyPlayers: boolean;
};

export function buildTocViewModel(input: TocInput): TocViewModel {
  const marketLabel = normalizeMarketLabel(input.marketTitle);
  const industryLabel = deriveIndustryLabel(marketLabel);
  const unitLabel = normalizeUnitLabel(input.unit);

  const allSegments = resolveSegments(input.segmentRows);
  const didTruncateSegments = allSegments.length > MAX_SEGMENTS;
  const segments = allSegments.slice(0, MAX_SEGMENTS).map((segment) => ({
    title: segment.title,
    items: segment.items.slice(0, MAX_SEGMENT_ITEMS),
  }));
  const didTruncateSegmentItems = segments.some((segment, index) => allSegments[index].items.length > MAX_SEGMENT_ITEMS);

  const allKeyPlayers = parseDelimitedLines(input.keyPlayersRaw);
  const didTruncateKeyPlayers = allKeyPlayers.length > MAX_KEY_PLAYERS;
  const keyPlayers = allKeyPlayers.slice(0, MAX_KEY_PLAYERS);

  const lines = buildDetailedLines({
    marketLabel,
    industryLabel,
    unitLabel,
    segments,
    keyPlayers,
  });

  return {
    marketLabel,
    industryLabel,
    segments,
    keyPlayers,
    lines,
    didTruncateSegments,
    didTruncateSegmentItems,
    didTruncateKeyPlayers,
  };
}

type TocBuilderContext = {
  marketLabel: string;
  industryLabel: string;
  unitLabel: string;
  segments: TocSegment[];
  keyPlayers: string[];
};

function buildDetailedLines(context: TocBuilderContext): TocLine[] {
  const { marketLabel, industryLabel, unitLabel, segments, keyPlayers } = context;
  const lines: TocLine[] = [];
  const addLine = (text: string, options?: Pick<TocLine, "strong" | "italic">) => {
    lines.push({
      text,
      strong: options?.strong,
      italic: options?.italic,
    });
  };
  const addSectionGap = () => {
    lines.push({ text: "", spacer: true });
  };

  addLine(`1. ${marketLabel} Introduction`, { strong: true });
  addLine("1.1. Study Assumption and Market Definition");
  addLine("1.2. Scope of the Study");
  addLine("1.3. Executive Summary");
  addSectionGap();

  addLine(`2. Global ${marketLabel}: Competitive Landscape`, { strong: true });
  addLine("2.1. MMR Competition Matrix");
  addLine("2.2. Competitive Landscape");
  addLine("2.3. Key Players Benchmarking");
  addLine("2.3.1. Company Name", { italic: true });
  addLine("2.3.2. Business Segment", { italic: true });
  addLine("2.3.3. End-user Segment", { italic: true });
  addLine("2.3.4. Revenue (2025)", { italic: true });
  addLine("2.3.5. Company Locations", { italic: true });
  addLine(`2.4. Leading ${marketLabel} Companies, by market capitalization`);
  addLine("2.5. Market Structure");
  addLine("2.5.1. Market Leaders", { italic: true });
  addLine("2.5.2. Market Followers", { italic: true });
  addLine("2.5.3. Emerging Players", { italic: true });
  addLine("2.6. Mergers and Acquisitions Details");
  addSectionGap();

  addLine(`3. ${marketLabel}: Dynamics`, { strong: true });
  addLine(`3.1. ${marketLabel} Trends by Region`);
  addLine(`3.1.1. North America ${marketLabel} Trends`, { italic: true });
  addLine(`3.1.2. Europe ${marketLabel} Trends`, { italic: true });
  addLine(`3.1.3. Asia Pacific ${marketLabel} Trends`, { italic: true });
  addLine(`3.1.4. Middle East and Africa ${marketLabel} Trends`, { italic: true });
  addLine(`3.1.5. South America ${marketLabel} Trends`, { italic: true });
  addLine(`3.2. ${marketLabel} Dynamics by Region`);

  const regionDynamics: Array<{ region: string; section: string }> = [
    { region: "North America", section: "3.2.1" },
    { region: "Europe", section: "3.2.2" },
    { region: "Asia Pacific", section: "3.2.3" },
    { region: "Middle East and Africa", section: "3.2.4" },
    { region: "South America", section: "3.2.5" },
  ];

  for (const dynamicRegion of regionDynamics) {
    addLine(`${dynamicRegion.section}. ${dynamicRegion.region}`, { italic: true });
    addLine(`${dynamicRegion.section}.1. ${dynamicRegion.region} ${marketLabel} Drivers`, { italic: true });
    addLine(`${dynamicRegion.section}.2. ${dynamicRegion.region} ${marketLabel} Restraints`, { italic: true });
    addLine(`${dynamicRegion.section}.3. ${dynamicRegion.region} ${marketLabel} Opportunities`, { italic: true });
    addLine(`${dynamicRegion.section}.4. ${dynamicRegion.region} ${marketLabel} Challenges`, { italic: true });
  }

  addLine("3.3. PORTER's Five Forces Analysis");
  addLine("3.4. PESTLE Analysis");
  addLine("3.5. Technology Roadmap");
  addLine("3.6. Regulatory Landscape by Region");
  addLine("3.6.1. North America", { italic: true });
  addLine("3.6.2. Europe", { italic: true });
  addLine("3.6.3. Asia Pacific", { italic: true });
  addLine("3.6.4. Middle East and Africa", { italic: true });
  addLine("3.6.5. South America", { italic: true });
  addLine(`3.7. Key Opinion Leader Analysis For ${industryLabel} Industry`);
  addLine(`3.8. Analysis of Government Schemes and Initiatives For ${industryLabel} Industry`);
  addLine(`3.9. ${marketLabel} Trade Analysis`);
  addLine(`3.10. The Global Pandemic Impact on ${marketLabel}`);
  addSectionGap();

  addLine(`4. ${marketLabel}: Global Market Size and Forecast by Segmentation (in ${unitLabel}) 2025-2032`, { strong: true });

  for (let segmentIndex = 0; segmentIndex < segments.length; segmentIndex += 1) {
    const segmentNumber = segmentIndex + 1;
    const segment = segments[segmentIndex];
    addLine(`4.${segmentNumber}. ${marketLabel} Size and Forecast, by ${segment.title} (2025-2032)`);
    for (let itemIndex = 0; itemIndex < segment.items.length; itemIndex += 1) {
      addLine(`4.${segmentNumber}.${itemIndex + 1}. ${segment.items[itemIndex]}`, { italic: true });
    }
  }

  const globalRegionSection = segments.length + 1;
  addLine(`4.${globalRegionSection}. ${marketLabel} Size and Forecast, by Region (2025-2032)`);
  for (let regionIndex = 0; regionIndex < GLOBAL_REGIONS.length; regionIndex += 1) {
    addLine(`4.${globalRegionSection}.${regionIndex + 1}. ${GLOBAL_REGIONS[regionIndex]}`, { italic: true });
  }
  addSectionGap();

  for (const chapter of REGIONAL_CHAPTERS) {
    addRegionalChapter(lines, chapter, marketLabel, segments, unitLabel);
    addSectionGap();
  }

  addLine("10. Company Profile: Key Players", { strong: true });
  if (keyPlayers.length > 0) {
    addLine(`10.1. ${keyPlayers[0]}`);
    for (let detailIndex = 0; detailIndex < PROFILE_DETAILS.length; detailIndex += 1) {
      addLine(`10.1.${detailIndex + 1}. ${PROFILE_DETAILS[detailIndex]}`, { italic: true });
    }
  }
  for (let playerIndex = 1; playerIndex < keyPlayers.length; playerIndex += 1) {
    addLine(`10.${playerIndex + 1}. ${keyPlayers[playerIndex]}`);
  }
  addSectionGap();

  addLine("11. Key Findings", { strong: true });
  addSectionGap();
  addLine("12. Industry Recommendations", { strong: true });
  addSectionGap();
  addLine(`13. ${marketLabel}: Research Methodology`, { strong: true });
  addSectionGap();
  addLine("14. Terms and Glossary", { strong: true });

  return lines;
}

function addRegionalChapter(
  lines: TocLine[],
  chapter: RegionalChapter,
  marketLabel: string,
  segments: TocSegment[],
  unitLabel: string
) {
  lines.push({
    text: `${chapter.chapter}. ${chapter.region} ${marketLabel} Size and Forecast by Segmentation (in ${unitLabel}) 2025-2032`,
    strong: true,
  });

  for (let segmentIndex = 0; segmentIndex < segments.length; segmentIndex += 1) {
    const segmentNumber = segmentIndex + 1;
    const segment = segments[segmentIndex];
    lines.push({
      text: `${chapter.chapter}.${segmentNumber}. ${chapter.region} ${marketLabel} Size and Forecast, by ${segment.title} (2025-2032)`,
    });

    if (chapter.includeSegmentItems) {
      for (let itemIndex = 0; itemIndex < segment.items.length; itemIndex += 1) {
        lines.push({
          text: `${chapter.chapter}.${segmentNumber}.${itemIndex + 1}. ${segment.items[itemIndex]}`,
          italic: true,
        });
      }
    }
  }

  const countrySection = segments.length + 1;
  lines.push({
    text: `${chapter.chapter}.${countrySection}. ${chapter.region} ${marketLabel} Size and Forecast, by Country (2025-2032)`,
  });

  for (let countryIndex = 0; countryIndex < chapter.countries.length; countryIndex += 1) {
    const countryNumber = countryIndex + 1;
    const country = chapter.countries[countryIndex];
    lines.push({
      text: `${chapter.chapter}.${countrySection}.${countryNumber}. ${country}`,
      strong: true,
      italic: true,
    });

    for (let segmentIndex = 0; segmentIndex < segments.length; segmentIndex += 1) {
      const segmentNumber = segmentIndex + 1;
      const segment = segments[segmentIndex];
      lines.push({
        text: `${chapter.chapter}.${countrySection}.${countryNumber}.${segmentNumber}. ${country} ${marketLabel} Size and Forecast, by ${segment.title} (2025-2032)`,
        italic: true,
      });

      if (chapter.includeCountrySegmentItems) {
        for (let itemIndex = 0; itemIndex < segment.items.length; itemIndex += 1) {
          lines.push({
            text: `${chapter.chapter}.${countrySection}.${countryNumber}.${segmentNumber}.${itemIndex + 1}. ${segment.items[itemIndex]}`,
            italic: true,
          });
        }
      }
    }
  }
}

function resolveSegments(segmentRows: SegmentRowInput[]): TocSegment[] {
  const allCandidates = segmentRows
    .filter((row) => row.title.trim().length > 0 && row.linesRaw.trim().length > 0)
    .filter((row) => !looksLikeRegion(row.title));

  const preferred = allCandidates.filter((row) => row.includeInTable);
  const source = preferred.length > 0 ? preferred : allCandidates;

  return source.map((row) => ({
    title: row.title.trim(),
    items: extractSegmentItems(row.linesRaw),
  }));
}

function extractSegmentItems(raw: string): string[] {
  const nodes = parseIndentedHierarchy(raw);
  const topLevel = nodes.filter((node) => node.depth === 0).map((node) => node.label.trim());
  const fallback = nodes.map((node) => node.label.trim());
  return dedupeNonEmpty(topLevel.length > 0 ? topLevel : fallback);
}

function normalizeMarketLabel(raw: string): string {
  const cleaned = raw.trim().replace(/\s+/g, " ");
  if (!cleaned) return "Market";
  if (/\bmarket\b/i.test(cleaned)) return cleaned;
  return `${cleaned} Market`;
}

function normalizeUnitLabel(raw: string): string {
  const cleaned = raw.trim().replace(/\s+/g, " ");
  return cleaned.length > 0 ? cleaned : "USD Million";
}

function deriveIndustryLabel(marketLabel: string): string {
  const withoutMarket = marketLabel.replace(/\bmarket\b/gi, "").trim().replace(/\s+/g, " ");
  return withoutMarket.length > 0 ? withoutMarket : marketLabel;
}

function parseDelimitedLines(raw: string): string[] {
  return dedupeNonEmpty(
    raw
      .split(/\r?\n|,|;/g)
      .map((value) => value.trim())
      .filter((value) => value.length > 0)
  );
}

function dedupeNonEmpty(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const normalized = value.trim();
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(normalized);
  }
  return result;
}

function looksLikeRegion(title: string): boolean {
  return /(region|country|geograph|state|area)/i.test(title);
}
