import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnChanges, OnInit } from '@angular/core';

interface Chat {
  id: number;
  name: string;
}
interface NewChat {
  name: string;
}

interface ChatMsg {
  id: number;
  chatId: number;
  content: string;
  isAi: boolean;
  opinion: null | number;
  chat: Chat;
}

interface NewChatMsg {
  chatId: number;
  content: string;
  isAi: boolean;
  opinion: null | number;
  chat: Chat;
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
  public inputText: string = '';
  public streamingAnswer: boolean = false;
  public newParsedChat: ChatMsg[] = [];
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
    this.getMessages(this.selectedChat!.id);
    this.clearInputText();
  }

  unselectChat() {
    if (this.streamingAnswer) {
      this.cancelStreaming();
    }

    this.selectedChat = null;
    this.newParsedChat = [];
    this.clearInputText();
  }

  saveOpinion(msgId: number, opinion: number) {
    const queryMsg = this.newParsedChat.find(msg => msg.id === msgId);
    if (!queryMsg) {
      return;
    }
    let targetOpinion = opinion;

    if (queryMsg.opinion === opinion) {
      targetOpinion = 0; // Reset opinion if it's the same as the current one
    }
    queryMsg.opinion = targetOpinion;

    this.updateRemoteMessage(queryMsg);
  }

  sendPrompt() {
    if (this.inputText.trim() === '') {
      return;
    }

    if (!this.selectedChat) {
      this.createNewRemoteChat(this.inputText);
    } else {
      this.createNewRemoteMessage(this.selectedChat.id, this.inputText, false);
      this.clearInputText();
    }
  }

  cancelStreaming() {
    this.eventSource?.close();
    this.handleEndStream();
  }

  private updateRemoteMessage(message: ChatMsg) {
    this.http.put(`/Chat/${message.chatId}/messages/${message.id}`, message).subscribe(
      () => {
        console.log('Message updated successfully');
      },
      (error) => {
        console.error('Error updating message:', error);
      }
    );
  }

  private getMessages(chatId: number) {
    this.http.get<ChatMsg[]>(`/Chat/${chatId}/messages`).subscribe(
      (result) => {
        console.log('Fetched messages:', result);
        this.newParsedChat = result;
        this.ref.detectChanges();
      },
      (error) => {
        console.error('Error fetching messages:', error);
      }
    );
  }

  private createNewRemoteChat(userPrompt: string) {
    const newChat: NewChat = {
      name: userPrompt,
    };
    this.http.post<Chat>('/Chat', newChat).subscribe(
      (result) => {
        this.selectedChat = result;
        this.getChats();
        this.createNewRemoteMessage(result.id, userPrompt, false);
        this.clearInputText();
        this.ref.detectChanges();
      },
      (error) => {
        console.error('Error creating new chat:', error);
      }
    );
  }

  private createNewRemoteMessage(chatId: number, content: string, isAi: boolean) {
    const newMessage: NewChatMsg = {
      chatId: chatId,
      content: content,
      isAi: isAi,
      opinion: 0,
      chat: this.selectedChat!,
    };
    this.http.post<ChatMsg>(`/Chat/${chatId}/message`, newMessage).subscribe(
      (result) => {
        if (!result.isAi) {
          this.newParsedChat.push(result);
          this.getAnswer(this.selectedChat!.id);
        } else {
          this.newParsedChat[this.newParsedChat.length - 1] = result;
        }
        this.ref.detectChanges();
      },
      (error) => {
        console.error('Error creating new message:', error);
      }
    );
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

  private getAnswer(chatId: number) {
    this.newParsedChat.push({
      id: 0,
      chatId: chatId,
      content: 'Generating...',
      isAi: true,
      opinion: 0,
      chat: this.selectedChat!,
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

      this.newParsedChat[this.newParsedChat.length - 1].content = accumulated + "\nGenerating...";
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
    const cleanedContent = this.newParsedChat[this.newParsedChat.length - 1].content.slice(0, -13); // Remove "Generating...""
    this.newParsedChat[this.newParsedChat.length - 1].content = cleanedContent;
    this.ref.detectChanges();
    this.eventSource?.close();
    this.eventSource = null;

    this.createNewRemoteMessage(this.selectedChat!.id, cleanedContent, true);
  }

  title = 'recruitmentgiganci.client';
}
