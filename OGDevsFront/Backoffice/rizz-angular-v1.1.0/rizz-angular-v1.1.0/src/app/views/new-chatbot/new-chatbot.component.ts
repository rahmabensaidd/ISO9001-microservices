import { Component } from '@angular/core';
import { NewChatbotService } from '@/app/services/new-chatbot.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-new-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-chatbot.component.html',
  styleUrls: ['./new-chatbot.component.css']
})
export class NewChatbotComponent {
  userInput: string = '';
  messages: { text: string, isUser: boolean }[] = [];
  isLoading: boolean = false;

  constructor(private chatbotService: NewChatbotService) {}

  async sendMessage() {
    if (!this.userInput.trim()) return;

    // Add user message
    this.messages.push({ text: this.userInput, isUser: true });
    this.isLoading = true;

    // Send message to chatbot
    try {
      const response = await firstValueFrom(await this.chatbotService.sendMessage(this.userInput));
      if (response.error) {
        this.messages.push({ text: `Error: ${response.error}`, isUser: false });
      } else {
        this.messages.push({ text: response.response, isUser: false });
      }
    } catch (error: any) {
      this.messages.push({ text: `Error: ${error.message}`, isUser: false });
    } finally {
      this.isLoading = false;
    }

    this.userInput = '';
  }

  extractNonCode(text: string): string {
    const codeMatch = text.match(/```python\n[\s\S]*?\n```/);
    if (codeMatch) {
      return text.replace(/```python\n[\s\S]*?\n```/, '').trim();
    }
    return text.trim();
  }

  extractCode(text: string): string | null {
    const codeMatch = text.match(/```python\n([\s\S]*?)\n```/);
    return codeMatch ? codeMatch[1] : null;
  }

  clear() {
    this.messages = [];
    this.userInput = '';
  }
}
