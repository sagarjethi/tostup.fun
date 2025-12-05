import { TRADER_COLORS } from "./constants";

const HARD_MATCH_COLORS: Record<string, string> = {
    deepseek: "#4D6BFE",
    openai: "#004331", // OpenAI Green
    gemini: "#00A4EF",
    risk: "#b91c1c", // Red for Risk
    portfolio: "#6d28d9", // Purple for Portfolio
    execution: "#047857", // Green for Execution
};

function hashTraderId(traderId: string): number {
    let hash = 0;
    for (let i = 0; i < traderId.length; i++) {
        const char = traderId.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

export function getTraderColor(
    traderId: string,
    allTraderIds?: string[],
    traderName?: string,
    description?: string | null
): string {
    // Priority: check hard match rules by name/role
    const searchText = `${traderName || ""} ${traderId} ${description || ""}`.toLowerCase();

    // Keyword check
    if (searchText.includes("risk")) return HARD_MATCH_COLORS.risk;
    if (searchText.includes("portfolio")) return HARD_MATCH_COLORS.portfolio;
    if (searchText.includes("execution") || searchText.includes("trader")) return HARD_MATCH_COLORS.execution;
    if (searchText.includes("deepseek")) return HARD_MATCH_COLORS.deepseek;
    if (searchText.includes("openai")) return HARD_MATCH_COLORS.openai;
    if (searchText.includes("gemini")) return HARD_MATCH_COLORS.gemini;

    // Fallback hash
    const index = hashTraderId(traderId);
    return TRADER_COLORS[index % TRADER_COLORS.length];
}

export function getTraderBackgroundColor(
    traderId: string,
    allTraderIds?: string[],
    traderName?: string,
    description?: string | null,
    opacity: number = 0.1
): string {
    const color = getTraderColor(traderId, allTraderIds, traderName, description);

    // Convert hex color to rgb simpler regex
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    if (!result) return `rgba(20, 20, 20, ${opacity})`;

    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
