package com.insurecrm.ai_service;

import dev.langchain4j.model.anthropic.AnthropicChatModel;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.service.AiServices;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AiService {

    private final InsuranceAgent insuranceAgent;

    public AiService(
            @Value("${anthropic.api.key}") String apiKey,
            InsuranceCrmTools tools) {


        AnthropicChatModel model = AnthropicChatModel.builder()
                .apiKey(apiKey)
                .modelName("claude-sonnet-4-5")
                .maxTokens(2048)
                .build();

        this.insuranceAgent = AiServices.builder(InsuranceAgent.class)
                .chatLanguageModel(model)
                .tools(tools)
                .chatMemory(MessageWindowChatMemory.withMaxMessages(20))
                .build();
    }

    public String chat(String message) {
        return insuranceAgent.chat(message);
    }
}