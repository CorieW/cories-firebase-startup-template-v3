# packages/dashboard/src/components/chat

Chat UI pieces.

## Directories

- None.

## Files

- `AssistantChatComposer.tsx`: Extracted message composer and submit controls for assistant chat panel.
- `AssistantChatMetrics.tsx`: Extracted assistant chat billing summary cards.
- `AssistantChatPanel.tsx`: Minimal product chat panel that tracks Autumn chat usage.
- `AssistantChatTranscript.tsx`: Extracted transcript and message list for assistant chat panel.
- `SupportChatPanel.tsx`: Support chat panel UI.
- `assistant-chat.lib.ts`: Assistant chat reply and error parsing helpers.
- `use-assistant-chat.ts`: Assistant chat state, Autumn usage checks, and submit handling.

## Writing Rules

- Keep chat UI focused on presentation and local interaction state.
- Move reusable chat support logic into shared libs if it grows beyond dir.
