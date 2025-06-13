using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecruitmentGiganci.Server.Models;

namespace RecruitmentGiganci.Server.Services
{

    public class ChatService
    {
        private readonly RecruitmentgigaContext db;
        private const string answerLine = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
            "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";


        public ChatService()
        {
            db = new RecruitmentgigaContext();
        }

        public ActionResult GetChatList()
        {
            return new OkObjectResult(db.Chats.ToList());
        }

        public ActionResult CreateChat(Chat newChat)
        {
            var chat = new Chat
            {
                Name = newChat.Name,
            };

            db.Chats.Add(chat);
            db.SaveChanges();

            return new CreatedAtRouteResult(
                routeName: null,
                routeValues: new { id = chat.Id },
                value: chat
            );
        }

        public ActionResult CreateMessage(int chatId, Message newMessage)
        {
            var chat = db.Chats.FirstOrDefault(c => c.Id == chatId);
            if (chat == null)
            {
                return new NotFoundObjectResult("Chat not found.");
            }
            newMessage.ChatId = chatId;
            db.Messages.Add(newMessage);
            db.SaveChanges();
            return new CreatedAtActionResult(nameof(GetChatList), "Chat", new { id = chat.Id }, newMessage);
        }

        public ActionResult GetMessages(int chatId)
        {
            var chat = db.Chats.FirstOrDefault(c => c.Id == chatId);
            if (chat == null)
            {
                return new NotFoundObjectResult("Chat not found.");
            }
            return new OkObjectResult(db.Messages.Where(m => m.ChatId == chatId).ToList());
        }

        public ActionResult UpdateMessage(int chatId, int messageId, Message updatedMessage)
        {
            var chat = db.Chats.FirstOrDefault(c => c.Id == chatId);
            if (chat == null)
            {
                return new NotFoundObjectResult("Chat not found.");
            }
            var message = db.Messages.FirstOrDefault(m => m.Id == messageId && m.ChatId == chatId);
            if (message == null)
            {
                return new NotFoundObjectResult("Message not found.");
            }
            message.Opinion = updatedMessage.Opinion;
            db.Entry(message).State = EntityState.Modified;
            db.SaveChanges();
            return new OkObjectResult(message);
        }

        public IEnumerable<string> GetAnswerStream()
        {
            return GenerateSimulatedAnswer();
        }

        private List<String> GenerateSimulatedAnswer()
        {
            int answerType = new Random().Next(1, 3);

            switch (answerType)
            {
                case 1:
                    return new List<string> { answerLine };
                case 2:
                    return CreateParagraph();
                default:
                    return CreateMultipleParagraphs();
            }
        }

        private List<string> CreateParagraph()
        {
            return new List<string> { answerLine + "\n", answerLine };
        }

        private List<string> CreateMultipleParagraphs()
        {
            List<string> paragraph = CreateParagraph();
            List<string> multipleParagraphs = new List<string>(paragraph);
            multipleParagraphs.AddRange(paragraph);
            multipleParagraphs.Add("\n\n");
            multipleParagraphs.AddRange(paragraph);

            return multipleParagraphs;
        }
    }
}