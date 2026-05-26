package com.insurecrm.ai_service;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        String contextualMessage = request.agentEmail() != null
                ? "Agent email: " + request.agentEmail() + "\n" + request.message()
                : request.message();

        String response = aiService.chat(contextualMessage);
        return ResponseEntity.ok(new ChatResponse(response, request.agentEmail()));
    }
}