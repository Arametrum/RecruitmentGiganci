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

        public ActionResult UpdateChat(int id, Chat updatedChat)
        {
            if (updatedChat == null || id != updatedChat.Id)
            {
                return new BadRequestResult();
            }

            var chat = db.Chats.FirstOrDefault(c => c.Id == id);
            if (chat == null)
            {
                return new NotFoundResult();
            }

            chat.Name = updatedChat.Name;
            chat.ChatString = updatedChat.ChatString;

            db.Entry(chat).State = EntityState.Modified;
            db.SaveChanges();

            return new OkObjectResult(chat);
        }

        public ActionResult CreateChat(Chat newChat)
        {
            var chat = new Chat
            {
                Name = newChat.Name,
                ChatString = newChat.ChatString
            };

            db.Chats.Add(chat);
            db.SaveChanges();

            return new CreatedAtRouteResult(
                routeName: null,
                routeValues: new { id = chat.Id },
                value: chat
            );
        }

        public IEnumerable<string> GetAnswerStream()
        {
            return GenerateSimulatedAnswer();
        }

        private List<String> GenerateSimulatedAnswer()
        {
            int answerType = 3;

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