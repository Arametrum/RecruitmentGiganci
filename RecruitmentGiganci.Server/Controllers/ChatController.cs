using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecruitmentGiganci.Server.Models;
using RecruitmentGiganci.Server.Services;
using System.Text;

namespace RecruitmentGiganci.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ChatController : ControllerBase
    {

        private readonly ILogger<ChatController> _logger;
        private readonly RecruitmentgigaContext db;
        private readonly ChatService chatService;

        public ChatController(ILogger<ChatController> logger)
        {
            _logger = logger;
            db = new RecruitmentgigaContext();
            chatService = new ChatService();
        }

        [HttpGet(Name = "GetChatList")]
        public IActionResult GetChatList()
        {
            return chatService.GetChatList() ;
        }  

        [HttpPost(Name = "CreateChat")]
        public IActionResult CreateChat([FromBody] Chat newChat)
        {
            if (newChat == null || string.IsNullOrWhiteSpace(newChat.Name))
            {
                return BadRequest("Chat name is required.");
            }

            return chatService.CreateChat(newChat);
        }

        [HttpGet("{id}/answer")]
        public async Task GetChatAnswer(int id)
        {
            Response.ContentType = "text/event-stream";
            await Task.Delay(1000); // Initial delay to simulate processing time

            foreach (var line in chatService.GetAnswerStream())
            {
                await Task.Delay(2000); // 2 seconds delay between messages
                var jel = System.Text.Json.JsonEncodedText.Encode(line);
                var data = $"data: {jel}\n\n";
                var buffer = Encoding.UTF8.GetBytes(data);
                await Response.Body.WriteAsync(buffer, 0, buffer.Length);
                await Response.Body.FlushAsync();
            }

            var endSignal = "data: end\n\n";
            var endBuffer = Encoding.UTF8.GetBytes(endSignal);
            await Response.Body.WriteAsync(endBuffer, 0, endBuffer.Length);
            await Response.Body.FlushAsync();
            await Response.CompleteAsync();
        }

        [HttpPost("{chatId}/message")]
        public IActionResult PostMessage(int chatId, [FromBody] Message newMessage)
        {
            if (newMessage == null || newMessage.Content == null)
            {
                return BadRequest("Message content is required.");
            }

            return chatService.CreateMessage(chatId, newMessage);
        }

        [HttpGet("{id}/messages")]
        public IActionResult GetMessages(int id)
        {
            return chatService.GetMessages(id);
        }

        [HttpPut("{id}/messages/{messageId}")]
        public IActionResult PutMessage(int id, int messageId, [FromBody] Message updatedMessage)
        {
            if (updatedMessage == null || messageId != updatedMessage.Id)
            {
                return BadRequest();
            }
            return chatService.UpdateMessage(id, messageId, updatedMessage);
        }
        // No deleting as I genuinely misread the requirements for the task and have already spent way longer than expected ;-;
    }
}
