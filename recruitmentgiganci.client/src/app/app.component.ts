import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MessagePair, parseChatString } from './helper-scripts';

interface Chat {
  id: number;
  name: string;
  chatString: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  public chats: Chat[] = [];
  public displayedColumns: string[] = ['name'];
  public selectedChat: Chat | null = null;
  public loadedChats = false;
  public parsedSelectedChat: MessagePair[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getChats();
  }

  selectChat(chatId: any) {
    this.selectedChat = this.chats.find((chat) => chat.id === chatId) || null;
    this.parsedSelectedChat = parseChatString(this.selectedChat?.chatString || '');
  }

  unselectChat() {
    this.selectedChat = null;
  }

  getChats() {
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

  title = 'recruitmentgiganci.client';
}
