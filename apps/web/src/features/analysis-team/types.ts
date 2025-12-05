export interface AnalysisRecord {
    id: string;
    traderId: string;
    role: string;
    chat: string;
    jsonValue?: string | null;
    recordId?: string | null;
    orderId?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface AnalysisRecordWithTrader extends AnalysisRecord {
    traderName?: string | null;
}

export interface AnalysisGroup {
    key: string;
    recordId: string | null;
    records: AnalysisRecordWithTrader[];
    latest: string;
    traderId: string;
    traderName: string | null;
}
