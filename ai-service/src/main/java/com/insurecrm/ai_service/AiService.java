package com.insurecrm.ai_service;

import dev.langchain4j.model.anthropic.AnthropicChatModel;
import dev.langchain4j.service.AiServices;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AiService {

    private final AnthropicChatModel model;
    private final InsuranceCrmTools tools;

    public AiService(
            @Value("${anthropic.api.key}") String apiKey,
            @Value("${anthropic.model:claude-sonnet-4-5}") String modelName,
            InsuranceCrmTools tools) {

        this.model = AnthropicChatModel.builder()
                .apiKey(apiKey)
                .modelName(modelName)
                .maxTokens(2048)
                .build();
        this.tools = tools;
    }

    public String chat(String message) {
        // Create a stateless per-request agent — no shared memory between users
        InsuranceAgent agent = AiServices.builder(InsuranceAgent.class)
                .chatLanguageModel(model)
                .tools(tools)
                .build();
        return agent.chat(message);
    }
}
