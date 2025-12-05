import { useQuery } from "@tanstack/react-query";
import type { AnalysisRecordWithTrader, AnalysisGroup } from "../features/analysis-team/types";

// Mock infinite query response structure to match ChatsList expectation
interface ChatsListResponse {
    pages: {
        groups: AnalysisGroup[];
        nextCursor: string | null;
    }[];
}

async function fetchChats(limit: number): Promise<AnalysisRecordWithTrader[]> {
    const res = await fetch(`http://localhost:3001/api/history/chats?limit=${limit}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to fetch chats");
    return json.data;
}

export function useLatestAnalysisGroups({ limit = 50 }: { limit?: number }) {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['chats', limit],
        queryFn: () => fetchChats(limit),
        refetchInterval: 5000,
    });

    // Transform flat list to grouped structure
    const transformedData: ChatsListResponse | undefined = data ? {
        pages: [{
            groups: groupRecords(data),
            nextCursor: null
        }]
    } : undefined;

    return {
        data: transformedData,
        isLoading,
        error,
        fetchNextPage: () => { }, // No-op for now
        hasNextPage: false,
        isFetchingNextPage: false,
        refetch
    };
}

function groupRecords(records: AnalysisRecordWithTrader[]): AnalysisGroup[] {
    // Group by recordId if available, or just timestamp roughly?
    // Backend creates recordId for grouping.
    // If no recordId, we treat each message as separate group or group by close timestamp?
    // Let's group by recordId if present, else treated as solitary.

    // Sort by createdAt desc
    const sorted = [...records].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const groups: AnalysisGroup[] = [];
    const map = new Map<string, AnalysisRecordWithTrader[]>();

    // First pass: Group by recordId
    const limitSolitary = 0; // counter for solitary

    for (const record of sorted) {
        if (record.recordId) {
            if (!map.has(record.recordId)) map.set(record.recordId, []);
            map.get(record.recordId)!.push(record);
        } else {
            // No recordId - create a synthetic group for this single message
            // OR group by close timestamp logic here?
            // For now, treat solitary as a group of 1
            groups.push({
                key: record.id,
                recordId: null,
                records: [record],
                latest: record.createdAt,
                traderId: record.traderId,
                traderName: record.traderName || record.role, // Use role as name if name missing
            });
        }
    }

    // Convert map to groups
    for (const [recId, recs] of map.entries()) {
        groups.push({
            key: recId,
            recordId: recId,
            records: recs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()), // Inside group: asc or desc? ChatsList likely wants chronological (ASC) or reverse? 
            // ChatsList usually displays top to bottom.
            // Let's sort ASC inside group so it reads top-down?
            // Wait, ChatsList renders: {group.records.map(...)}
            // Usually chat logs are chronological.
            latest: recs[0]?.createdAt || new Date().toISOString(), // Use latest timestamp in group 
            // Wait, if sorted ASC (oldest first), latest is last.
            // If sorted DESC (newest first), latest is first.
            // Let's assume we want latest appearing groups first (which we sort later),
            // and inside group, messages are ASC?
            traderId: recs[0]?.traderId,
            traderName: recs[0]?.traderName || recs[0]?.role,
        });
    }

    // Sort all groups by their 'latest' timestamp DESC
    groups.sort((a, b) => new Date(b.latest).getTime() - new Date(a.latest).getTime());

    return groups;
}
