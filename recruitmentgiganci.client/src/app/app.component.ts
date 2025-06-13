import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnChanges, OnInit } from '@angular/core';
import { Message, formatChatString, parseChatString } from './helper-scripts';

interface Chat {
  id: number;
  name: string;
  chatString: string;
}
interface NewChat {
  name: string;
  chatString: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnChanges {
  public chats: Chat[] = [];
  public displayedColumns: string[] = ['name'];
  public selectedChat: Chat | null = null;
  public loadedChats = false;
  public parsedSelectedChat: Message[] = [];
  public inputText: string = '';
  public streamingAnswer: boolean = false;
  private eventSource: EventSource | null = null;

  constructor(private http: HttpClient, private ref: ChangeDetectorRef) { }

  ngOnInit() {
    this.getChats();
  }

  ngOnChanges() {
  }

  selectChat(chatId: any) {
    if (this.streamingAnswer) {
      this.cancelStreaming();
    }

    this.selectedChat = this.chats.find((chat) => chat.id === chatId) || null;
    this.parsedSelectedChat = parseChatString(this.selectedChat?.chatString || '');
    this.clearInputText();
  }

  unselectChat() {
    if (this.streamingAnswer) {
      this.cancelStreaming();
    }

    this.selectedChat = null;
    this.parsedSelectedChat = [];
    this.clearInputText();
  }

  saveOpinion(msgId: number, opinion: number) {
    const queryMsg = this.parsedSelectedChat[msgId];
    let targetOpinion = opinion;

    if (queryMsg.opinion === opinion) {
      targetOpinion = 0; // Reset opinion if it's the same as the current one
    }
    queryMsg.opinion = targetOpinion;

    this.saveLocalChatString();
    this.updateRemoteChat();
  }

  sendPrompt() {
    this.parsedSelectedChat.push({
      id: this.parsedSelectedChat.length,
      content: this.inputText,
      type: 'user',
      opinion: null,
    });
    if (!this.selectedChat) {
      console.log('No chat selected, creating a new one.');
      this.createNewRemoteChat(this.inputText);
    } else {
      this.saveLocalChatString();
      this.getAnswer(this.selectedChat.id);
      this.clearInputText();
    }
  }

  public cancelStreaming() {
    this.eventSource?.close();
    this.handleEndStream();
  }

  private createNewRemoteChat(userPrompt: string) {
    const newChat: NewChat = {
      name: userPrompt,
      chatString: `${userPrompt}::`,
    };
    this.http.post<Chat>('/Chat', newChat).subscribe(
      (result) => {
        this.addNewLocalChat(result);
        this.getAnswer(this.selectedChat!.id);
        this.clearInputText();
        this.ref.detectChanges();
      },
      (error) => {
        console.error('Error creating new chat:', error);
      }
    );
  }

  private addNewLocalChat(newChat: Chat) {
    this.chats.push(newChat);
    this.selectedChat = newChat;
    this.parsedSelectedChat = parseChatString(newChat.chatString);
  }

  private saveLocalChatString() {
    const stringToSave = formatChatString(this.parsedSelectedChat);
    this.chats = this.chats.map((chat) => {
      if (chat.id === this.selectedChat?.id) {
        return {
          ...chat,
          chatString: stringToSave,
        };
      } else {
        return chat;
      }
    });
    this.selectedChat!.chatString = stringToSave;
  }

  private getChats() {
    this.http.get<Chat[]>('/Chat').subscribe(
      (result) => {
        this.chats = result;
        this.loadedChats = true;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  private updateRemoteChat() {
    if (this.selectedChat) {
      this.http.put(`/Chat/${this.selectedChat.id}`, this.selectedChat).subscribe(
        () => {
          this.ref.detectChanges();
          console.log('Chat updated successfully');
        },
        (error) => {
          console.error('Error updating chat:', error);
        }
      );
    }
  }

  private getAnswer(chatId: number) {
    this.parsedSelectedChat.push({
      id: this.parsedSelectedChat.length,
      content: 'Generating...',
      type: 'ai',
      opinion: 0,
    });

    const url = `/Chat/${chatId}/Answer`;

    this.streamingAnswer = true;
    this.eventSource = new EventSource(url);
    let accumulated = '';

    this.eventSource.onmessage = (event) => {
      if (event.data === 'end') {
        this.handleEndStream();
        return;
      }
      accumulated += event.data.replaceAll("\\n", "\n");

      this.parsedSelectedChat[this.parsedSelectedChat.length - 1].content = accumulated + "\nGenerating...";
      this.ref.detectChanges();
    };

    this.eventSource.onerror = (error) => {
      this.handleEndStream();
      console.error('Streaming error:', error);
    };

    this.eventSource.onopen = () => {
      this.streamingAnswer = true;
    };
  }

  private clearInputText() {
    this.inputText = '';
  }

  private handleEndStream() {
    this.streamingAnswer = false;
    const cleanedContent = this.parsedSelectedChat[this.parsedSelectedChat.length - 1].content.slice(0, -13); // Remove "Generating...""
    this.parsedSelectedChat[this.parsedSelectedChat.length - 1].content = cleanedContent;
    this.ref.detectChanges(); // Ensure the view updates
    this.eventSource?.close();
    this.eventSource = null;

    this.saveLocalChatString();
    this.updateRemoteChat();
  }

  title = 'recruitmentgiganci.client';
}
