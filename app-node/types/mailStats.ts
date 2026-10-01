export interface DailyMailStats {
    // UTC day, YYYY-MM-DD (Mailjet counts per UTC day)
    date: string;
    // accepted and sent on by Mailjet
    sent: number;
    // bounced, blocked or marked as spam
    failed: number;
}
