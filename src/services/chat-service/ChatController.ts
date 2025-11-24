// typescript
import {ChatClientFactory, ChatResponse, ChatRequest} from '../chat-client/ChatClient'
import type {ChatHandle} from '../../components/chat/Chat'
import type {Message} from '../../components/chat/ChatModel'
import React from "react";

export class ChatController {
    private client = ChatClientFactory('/api/message')
    private chatHandle?: React.RefObject<ChatHandle> | null

    constructor(baseUrl?: string) {
        if (baseUrl) this.client = ChatClientFactory(baseUrl)
    }

    attach(chatHandle: React.RefObject<ChatHandle>) {
        this.chatHandle = chatHandle
    }

    detach() {
        this.chatHandle = undefined
    }

    /**
     * Pass this method to the Chat component as `onSend`.
     * It:
     * - inserts an assistant placeholder message,
     * - calls the API with `stream: true`,
     * - appends streamed chunks to the placeholder via the Chat imperative API.
     */
    onSend = async (userMsg: Message): Promise<ChatResponse | undefined> => {
        const handle = this.chatHandle?.current
        if (!handle) {
            // no UI attached; still call API but cannot update UI
            const reqFallback: ChatRequest = {message: userMsg.text, stream: false}
            try {
                return await this.client.sendMessage(reqFallback)
            } catch {
                return undefined
            }
        }

        const assistantId = Date.now() + Math.floor(Math.random() * 1000)
        // create placeholder assistant message (use a non-empty invisible char so Chat.addMessage doesn't trim it away)
        handle.addMessage({id: assistantId, text: '\u200B', sender: 'assistant', time: Date.now()})

        const req: ChatRequest = {message: userMsg.text, stream: true}
        let isFirstChunk = true
        try {
            // always append incoming chunks to the placeholder message we created above
            return await this.client.sendMessage(req, {
                onMessage: (ev: ChatResponse) => {
                    if (isFirstChunk) {
                        isFirstChunk = false
                        handle.addMessage({
                            id: ev.id,
                            text: ev.response,
                            sender: 'assistant',
                            time: Date.now()
                        })
                    } else {
                        handle.appendMessage({
                            id: ev.id,
                            text: ev.response,
                            sender: 'assistant',
                            time: Date.now()
                        })
                    }
                }
            })
        } catch (err) {
            // show error text in the assistant message
            const errText = typeof err === 'string' ? err : (err instanceof Error ? err.message : 'Error')
            try {
                handle.appendMessage({
                    id: assistantId,
                    text: `\n\n[Error] ${errText}`,
                    sender: 'assistant',
                    time: Date.now()
                })
            } catch {
                // ignore
            }
            throw err
        }
    }
}