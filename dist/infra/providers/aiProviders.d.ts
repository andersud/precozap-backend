export interface AIMessage {
    role: "user" | "assistant";
    content: string;
}
export interface AIQueryInput {
    message: string;
    conversationHistory?: AIMessage[];
    context?: Record<string, unknown>;
}
export interface AIQueryOutput {
    message: string;
    productIds?: string[];
    tips?: string[];
    intent?: string;
    budget?: number | null;
    provider: string;
}
export interface AIProvider {
    query(input: AIQueryInput): Promise<AIQueryOutput>;
    isAvailable(): boolean;
}
export declare class MockAIProvider implements AIProvider {
    isAvailable(): boolean;
    query(input: AIQueryInput): Promise<AIQueryOutput>;
    private detectIntent;
    private extractBudget;
}
export declare class AnthropicAIProvider implements AIProvider {
    private apiKey;
    constructor(apiKey: string);
    isAvailable(): boolean;
    query(input: AIQueryInput): Promise<AIQueryOutput>;
}
//# sourceMappingURL=aiProviders.d.ts.map