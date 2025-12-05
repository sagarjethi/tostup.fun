import { ChatOpenAI } from '@langchain/openai';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { config } from '../config';

export const createLLM = (overrides?: { temperature?: number, model?: string }): BaseChatModel => {
    const provider = config.llm.provider;
    const temperature = overrides?.temperature || 0;

    console.log(`🧠 Initializing LLM: ${provider.toUpperCase()}`);

    if (provider === 'xai') {
        console.warn('⚠️ xAI provider is deprecated. Falling back to OpenAI.');
    }

    if (!config.llm.openaiKey) {
        console.warn('⚠️ No OPENAI_API_KEY found. LLM calls will fail.');
    }

    return new ChatOpenAI({
        modelName: overrides?.model || config.llm.model || 'gpt-4',
        temperature,
        openAIApiKey: config.llm.openaiKey,
    }) as unknown as BaseChatModel;
};
