package com.insurecrm.ai_service;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/ai")
public class AiController {

    private static final java.util.regex.Pattern EMAIL_PATTERN =
            java.util.regex.Pattern.compile("^[\\w._%+\\-]+@[\\w.\\-]+\\.[a-zA-Z]{2,}$");

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        // Validate email format to prevent prompt injection via agentEmail field
        String email = request.agentEmail();
        if (email != null && !EMAIL_PATTERN.matcher(email).matches()) {
            email = null;
        }

        StringBuilder ctx = new StringBuilder();
        if (email != null) {
            ctx.append("Agent email: ").append(email).append("\n\n");
        }

        List<ChatRequest.HistoryMessage> history = request.history();
        if (history != null && !history.isEmpty()) {
            ctx.append("Conversation history:\n");
            for (ChatRequest.HistoryMessage msg : history) {
                ctx.append(msg.role()).append(": ").append(msg.content()).append("\n");
            }
            ctx.append("\n");
        }

        ctx.append(request.message());

        String response = aiService.chat(ctx.toString());
        return ResponseEntity.ok(new ChatResponse(response, email));
    }
}
